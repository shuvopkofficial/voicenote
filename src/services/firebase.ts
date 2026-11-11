import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';
import { SalesSession } from '../types';

// User's provided Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://drivebot-d2a27-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'drivebot-d2a27',
  appId: '1:924283056911:web:107e24bc172f95ec0b847a',
};

// Initialize Firebase safely
let app;
let db: ReturnType<typeof getDatabase> | null = null;
let isFirebaseOnline = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getDatabase(app);
  isFirebaseOnline = true;
} catch (err) {
  console.warn('Firebase initialization notice:', err);
  isFirebaseOnline = false;
}

const LOCAL_STORAGE_KEY = 'poultry_scale_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'poultry_active_session_id';

// Local storage fallback helpers
export function getLocalSessions(): Record<string, SalesSession> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading local storage sessions', err);
    return {};
  }
}

export function saveLocalSessions(sessions: Record<string, SalesSession>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed saving to local storage', err);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string) {
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  } catch {}
}

// Sync session to Firebase Realtime Database and LocalStorage
export async function syncSessionToCloud(session: SalesSession): Promise<{ success: boolean; cloudSynced: boolean }> {
  // Always update local storage first (instant & offline-proof)
  const local = getLocalSessions();
  local[session.id] = session;
  saveLocalSessions(local);

  if (!db) {
    return { success: true, cloudSynced: false };
  }

  try {
    const sessionRef = ref(db, `poultry_sessions/${session.id}`);
    await set(sessionRef, session);
    return { success: true, cloudSynced: true };
  } catch (err) {
    console.warn('Could not sync to Firebase Realtime DB (saved locally):', err);
    return { success: true, cloudSynced: false };
  }
}

// Subscribe to real-time updates for a session
export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: SalesSession | null) => void
): () => void {
  // Load from local storage immediately
  const local = getLocalSessions();
  if (local[sessionId]) {
    onUpdate(local[sessionId]);
  }

  if (!db) {
    return () => {};
  }

  try {
    const sessionRef = ref(db, `poultry_sessions/${sessionId}`);
    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.val() as SalesSession;
          // Merge with local
          const localData = getLocalSessions();
          localData[sessionId] = cloudData;
          saveLocalSessions(localData);
          onUpdate(cloudData);
        }
      },
      (error) => {
        console.warn('Realtime database listen error, using local data:', error);
      }
    );

    return () => off(sessionRef, 'value', unsubscribe);
  } catch (err) {
    console.warn('Firebase listener setup failed:', err);
    return () => {};
  }
}

export { db, isFirebaseOnline };
