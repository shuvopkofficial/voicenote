import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SalesSession, Buyer, WeighingEntry } from './types';
import {
  getLocalSessions,
  saveLocalSessions,
  getActiveSessionId,
  setActiveSessionId,
  syncSessionToCloud,
  subscribeToSession,
  isFirebaseOnline,
} from './services/firebase';
import {
  parseSpokenBengaliLocally,
  parseSpokenBengaliWithServer,
  formatKgGrams,
  convertAsciiToBengaliDigits,
} from './utils/bengaliParser';
import { playSuccessChime, playErrorTone, speakBengali } from './utils/audioFeedback';
import { useVoiceListener } from './hooks/useVoiceListener';
import confetti from 'canvas-confetti';

// Components
import { Header } from './components/Header';
import { BigWeightDisplay } from './components/BigWeightDisplay';
import { VoiceMicHero } from './components/VoiceMicHero';
import { QuickTouchPad } from './components/QuickTouchPad';
import { BuyerSelector } from './components/BuyerSelector';
import { DariList } from './components/DariList';
import { SessionSummary } from './components/SessionSummary';
import { DigitalMemoModal } from './components/DigitalMemoModal';
import { EditEntryModal } from './components/EditEntryModal';
import { NewSessionModal } from './components/NewSessionModal';

import { Mic, Calculator, ListOrdered, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [voiceTTS, setVoiceTTS] = useState(true);
  const [activeTab, setActiveTab] = useState<'voice' | 'keypad' | 'list' | 'summary'>('voice');
  const [isCloudSynced, setIsCloudSynced] = useState(isFirebaseOnline);

  // Modals
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeighingEntry | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<Record<string, SalesSession>>(() => getLocalSessions());
  const [activeSessionIdState, setActiveSessionIdState] = useState<string>(() => {
    const existing = getActiveSessionId();
    if (existing && getLocalSessions()[existing]) return existing;

    // Create default initial session if none exists
    const initialBuyerId = 'buyer_naim';
    const initialSessionId = `session_${Date.now()}`;
    const initialSession: SalesSession = {
      id: initialSessionId,
      title: `আজকের মুরগী বিক্রি - ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}`,
      farmName: 'শুভ পোল্ট্রি খামার',
      date: new Date().toISOString(),
      status: 'active',
      buyers: {
        [initialBuyerId]: {
          id: initialBuyerId,
          name: 'নাইম',
          phone: '',
          ratePerKg: 165,
          defaultTareKg: 2.2,
          paidAmount: 0,
        },
      },
      entries: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const initialSessions = { [initialSessionId]: initialSession };
    saveLocalSessions(initialSessions);
    setActiveSessionId(initialSessionId);
    return initialSessionId;
  });

  const activeSession = sessions[activeSessionIdState] || null;

  // Active buyer selection
  const [activeBuyerId, setActiveBuyerId] = useState<string>(() => {
    if (activeSession && Object.keys(activeSession.buyers).length > 0) {
      return Object.keys(activeSession.buyers)[0];
    }
    return 'buyer_naim';
  });

  // Keep active buyer synced when session changes
  useEffect(() => {
    if (activeSession && (!activeSession.buyers[activeBuyerId] || !activeBuyerId)) {
      const firstBuyerId = Object.keys(activeSession.buyers)[0];
      if (firstBuyerId) {
        setActiveBuyerId(firstBuyerId);
      }
    }
  }, [activeSession, activeBuyerId]);

  // Sync to Firebase on mount or session change
  useEffect(() => {
    if (!activeSession) return;
    const unsubscribe = subscribeToSession(activeSession.id, (cloudSession) => {
      if (cloudSession) {
        setSessions((prev) => ({ ...prev, [cloudSession.id]: cloudSession }));
        setIsCloudSynced(true);
      }
    });
    return () => unsubscribe();
  }, [activeSession?.id]);

  // Save session update helper
  const updateCurrentSession = useCallback(
    async (updater: (prev: SalesSession) => SalesSession) => {
      if (!activeSession) return;
      const updated = updater(activeSession);
      updated.updatedAt = Date.now();

      setSessions((prev) => {
        const next = { ...prev, [updated.id]: updated };
        saveLocalSessions(next);
        return next;
      });

      const res = await syncSessionToCloud(updated);
      setIsCloudSynced(res.cloudSynced);
    },
    [activeSession]
  );

  // Add a new weighing entry
  const handleAddEntry = useCallback(
    async (data: {
      kg: number;
      grams: number;
      tareKg?: number;
      ratePerKg?: number;
      buyerName?: string;
      dariNumber?: number;
      birdCount?: number;
      rawText?: string;
    }) => {
      if (!activeSession) return;

      const grossKg = Number((data.kg + (data.grams || 0) / 1000).toFixed(3));
      if (grossKg <= 0) return;

      // Find or create buyer
      let targetBuyerId = activeBuyerId;
      let targetBuyer = activeSession.buyers[targetBuyerId];

      if (data.buyerName) {
        const existingBuyer = Object.values(activeSession.buyers).find(
          (b) => b.name.toLowerCase() === data.buyerName?.toLowerCase()
        );
        if (existingBuyer) {
          targetBuyerId = existingBuyer.id;
          targetBuyer = existingBuyer;
        } else {
          // Create new buyer on the fly!
          const newId = `buyer_${Date.now()}`;
          targetBuyer = {
            id: newId,
            name: data.buyerName,
            ratePerKg: data.ratePerKg || targetBuyer?.ratePerKg || 165,
            defaultTareKg: targetBuyer?.defaultTareKg || 2.2,
            paidAmount: 0,
          };
          targetBuyerId = newId;
        }
      }

      const tareKg = data.tareKg !== undefined ? data.tareKg : (targetBuyer?.defaultTareKg || 0);
      const netKg = Math.max(0, Number((grossKg - tareKg).toFixed(3)));
      const ratePerKg = data.ratePerKg || targetBuyer?.ratePerKg || 0;
      const totalAmount = Number((netKg * ratePerKg).toFixed(2));

      // Calculate next dāri number
      const nextDari = data.dariNumber || activeSession.entries.length + 1;

      const newEntry: WeighingEntry = {
        id: `dari_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId: activeSession.id,
        dariNumber: nextDari,
        buyerId: targetBuyerId,
        buyerName: targetBuyer.name,
        grossKg,
        tareKg,
        netKg,
        ratePerKg,
        totalAmount,
        birdCount: data.birdCount,
        timestamp: Date.now(),
        voiceTranscript: data.rawText,
      };

      await updateCurrentSession((prev) => {
        const nextBuyers = { ...prev.buyers };
        if (!nextBuyers[targetBuyerId]) {
          nextBuyers[targetBuyerId] = targetBuyer;
        }
        return {
          ...prev,
          buyers: nextBuyers,
          entries: [...prev.entries, newEntry],
        };
      });

      // Switch active buyer if voice specified a different one
      setActiveBuyerId(targetBuyerId);

      // Audio feedback
      playSuccessChime();

      if (voiceTTS) {
        const { textBn } = formatKgGrams(grossKg);
        speakBengali(`${targetBuyer.name}, ${textBn}`);
      }

      // Small confetti when reaching milestones (e.g. 10th dāri)
      if (nextDari % 10 === 0) {
        try {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        } catch {}
      }
    },
    [activeSession, activeBuyerId, updateCurrentSession, voiceTTS]
  );

  // Undo the last entry
  const handleUndoLatest = useCallback(async () => {
    if (!activeSession || activeSession.entries.length === 0) return;

    const lastEntry = activeSession.entries[activeSession.entries.length - 1];
    await updateCurrentSession((prev) => ({
      ...prev,
      entries: prev.entries.slice(0, -1),
    }));

    if (voiceTTS) {
      speakBengali(`দাঁড়ি ${lastEntry.dariNumber} বাতিল করা হয়েছে`);
    }
  }, [activeSession, updateCurrentSession, voiceTTS]);

  // Voice speech received handler
  const handleVoiceTranscript = useCallback(
    async (phrase: string) => {
      if (!activeSession) return;

      const knownBuyers = Object.values(activeSession.buyers).map((b) => b.name);
      const activeBuyer = activeSession.buyers[activeBuyerId];

      // 1. Fast local client-side parse (0ms)
      const localResult = parseSpokenBengaliLocally(
        phrase,
        knownBuyers,
        activeBuyer?.name,
        activeBuyer?.ratePerKg
      );

      if (localResult.isWeighingEntry && localResult.confidence >= 0.75) {
        await handleAddEntry({
          kg: localResult.kg,
          grams: localResult.grams,
          buyerName: localResult.buyerName || activeBuyer?.name,
          dariNumber: localResult.dariNumber || undefined,
          ratePerKg: localResult.ratePerKg || activeBuyer?.ratePerKg,
          birdCount: localResult.birdCount || undefined,
          rawText: phrase,
        });
        return;
      }

      // 2. Intelligent server Gemini fallback for dialect/complex phrasing
      try {
        const serverResult = await parseSpokenBengaliWithServer(
          phrase,
          activeBuyer?.name,
          activeBuyer?.ratePerKg
        );

        if (serverResult && serverResult.isWeighingEntry && serverResult.totalWeightKg > 0) {
          await handleAddEntry({
            kg: serverResult.kg,
            grams: serverResult.grams,
            buyerName: serverResult.buyerName || activeBuyer?.name,
            dariNumber: serverResult.dariNumber || undefined,
            ratePerKg: serverResult.ratePerKg || activeBuyer?.ratePerKg,
            birdCount: serverResult.birdCount || undefined,
            rawText: phrase,
          });
          return;
        }
      } catch (err) {
        console.warn('Voice parse fallback notice:', err);
      }

      // If not recognized as a weighing
      playErrorTone();
    },
    [activeSession, activeBuyerId, handleAddEntry]
  );

  // Initialize voice listener hook
  const {
    isListening,
    statusMessage,
    transcript,
    interimTranscript,
    wakeLockActive,
    toggleListening,
  } = useVoiceListener({
    onParsedResult: handleVoiceTranscript,
    voiceLang: 'bn-BD',
    isContinuous: true,
    enableTTSFeedback: voiceTTS,
  });

  // Buyer operations
  const handleAddBuyer = useCallback(
    async (name: string, rate: number, tare: number, phone?: string) => {
      const newId = `buyer_${Date.now()}`;
      const newBuyer: Buyer = {
        id: newId,
        name,
        phone,
        ratePerKg: rate,
        defaultTareKg: tare,
        paidAmount: 0,
      };

      await updateCurrentSession((prev) => ({
        ...prev,
        buyers: { ...prev.buyers, [newId]: newBuyer },
      }));
      setActiveBuyerId(newId);
    },
    [updateCurrentSession]
  );

  const handleUpdateBuyer = useCallback(
    async (updated: Buyer) => {
      await updateCurrentSession((prev) => ({
        ...prev,
        buyers: { ...prev.buyers, [updated.id]: updated },
      }));
    },
    [updateCurrentSession]
  );

  // Entry operations
  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      await updateCurrentSession((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== entryId),
      }));
    },
    [updateCurrentSession]
  );

  const handleUpdateEntry = useCallback(
    async (updated: WeighingEntry) => {
      await updateCurrentSession((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === updated.id ? updated : e)),
      }));
    },
    [updateCurrentSession]
  );

  // Session operations
  const handleCreateSession = useCallback(
    (title: string, farmName: string, defaultBuyerName: string) => {
      const newSessionId = `session_${Date.now()}`;
      const buyerId = `buyer_${Date.now()}`;

      const newSession: SalesSession = {
        id: newSessionId,
        title,
        farmName,
        date: new Date().toISOString(),
        status: 'active',
        buyers: {
          [buyerId]: {
            id: buyerId,
            name: defaultBuyerName,
            ratePerKg: 165,
            defaultTareKg: 2.2,
            paidAmount: 0,
          },
        },
        entries: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setSessions((prev) => {
        const next = { ...prev, [newSessionId]: newSession };
        saveLocalSessions(next);
        return next;
      });
      setActiveSessionId(newSessionId);
      setActiveSessionIdState(newSessionId);
      setActiveBuyerId(buyerId);
      syncSessionToCloud(newSession);
    },
    []
  );

  const handleUpdateFarmName = useCallback(
    async (farmName: string) => {
      await updateCurrentSession((prev) => ({ ...prev, farmName }));
    },
    [updateCurrentSession]
  );

  const activeBuyer = activeSession?.buyers[activeBuyerId] || {
    id: 'unknown',
    name: 'ক্রেতা',
    ratePerKg: 165,
    defaultTareKg: 2.2,
    paidAmount: 0,
  };

  const latestEntry = useMemo(() => {
    if (!activeSession || activeSession.entries.length === 0) return null;
    return activeSession.entries[activeSession.entries.length - 1];
  }, [activeSession]);

  const nextDariNumber = (activeSession?.entries.length || 0) + 1;

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-4 font-sans">
        <div className="text-center">
          <p className="text-base font-bold mb-2">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 antialiased">
      {/* Top Header */}
      <Header
        isCloudSynced={isCloudSynced}
        isFirebaseActive={isFirebaseOnline}
        voiceTTS={voiceTTS}
        setVoiceTTS={setVoiceTTS}
        wakeLockActive={wakeLockActive}
        onNewSession={() => setIsNewSessionOpen(true)}
        sessionTitle={activeSession.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 pb-24 space-y-3.5">
        {/* Scale-Side Big Weight Display (Readable from far away!) */}
        <BigWeightDisplay
          latestEntry={latestEntry}
          onUndoLatest={handleUndoLatest}
          totalEntriesCount={activeSession.entries.length}
          activeBuyerName={activeBuyer.name}
        />

        {/* Buyer Switcher Bar */}
        <BuyerSelector
          buyers={activeSession.buyers}
          activeBuyerId={activeBuyerId}
          onSelectBuyer={setActiveBuyerId}
          onAddBuyer={handleAddBuyer}
          onUpdateBuyer={handleUpdateBuyer}
          entries={activeSession.entries}
        />

        {/* Tab-specific View for iPhone 12 Pro ergonomics */}
        {activeTab === 'voice' && (
          <div className="space-y-3.5">
            <VoiceMicHero
              isListening={isListening}
              statusMessage={statusMessage}
              transcript={transcript}
              interimTranscript={interimTranscript}
              onToggleListening={toggleListening}
              onSampleClick={handleVoiceTranscript}
              activeBuyerName={activeBuyer.name}
            />

            {/* Quick summary strip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">মোট দাঁড়ি:</span>
                <span className="text-base font-extrabold font-mono text-slate-950">
                  {convertAsciiToBengaliDigits(activeSession.entries.length)} টি
                </span>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-slate-500 font-semibold">মোট ওজন:</span>
                <span className="text-base font-extrabold font-mono text-slate-950">
                  {convertAsciiToBengaliDigits(
                    activeSession.entries.reduce((sum, e) => sum + e.netKg, 0).toFixed(1)
                  )} কেজি
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keypad' && (
          <QuickTouchPad
            onAddEntry={handleAddEntry}
            nextDariNumber={nextDariNumber}
            activeBuyerName={activeBuyer.name}
            defaultTareKg={activeBuyer.defaultTareKg}
          />
        )}

        {activeTab === 'list' && (
          <DariList
            entries={activeSession.entries}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={setEditingEntry}
            activeBuyerId={activeBuyerId}
            activeBuyerName={activeBuyer.name}
          />
        )}

        {activeTab === 'summary' && (
          <div className="space-y-3.5">
            <SessionSummary
              session={activeSession}
              onOpenMemo={() => setIsMemoOpen(true)}
              onShareWhatsApp={() => setIsMemoOpen(true)}
              activeBuyerId={activeBuyerId}
            />
            <DariList
              entries={activeSession.entries}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={setEditingEntry}
              activeBuyerId={activeBuyerId}
              activeBuyerName={activeBuyer.name}
            />
          </div>
        )}
      </main>

      {/* Fixed Ergonomic Bottom Tab Bar (Tailored for iPhone 12 Pro Thumb Zone) */}
      <nav
        aria-label="মোবাইল ন্যাভিগেশন"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe shadow-xs"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
          {/* Tab 1: Voice */}
          <button
            onClick={() => setActiveTab('voice')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'voice'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Mic className="w-5 h-5 mb-0.5" />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">ভয়েস স্কেল</span>
            {activeTab === 'voice' && (
              <span className="w-4 h-0.5 bg-slate-950 rounded-full mt-0.5" />
            )}
          </button>

          {/* Tab 2: Keypad */}
          <button
            onClick={() => setActiveTab('keypad')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'keypad'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calculator className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">টাচ কিপ্যাড</span>
            {activeTab === 'keypad' && (
              <span className="w-4 h-0.5 bg-slate-950 rounded-full mt-0.5" />
            )}
          </button>

          {/* Tab 3: Dari List */}
          <button
            onClick={() => setActiveTab('list')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'list'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ListOrdered className="w-5 h-5 mb-0.5" />
              {activeSession.entries.length > 0 && (
                <span className="absolute -top-1 -right-2 px-1 rounded-full bg-slate-100 text-slate-800 font-mono text-[9px] font-bold border border-slate-200">
                  {convertAsciiToBengaliDigits(activeSession.entries.length)}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">দাঁড়ি খাতা</span>
            {activeTab === 'list' && (
              <span className="w-4 h-0.5 bg-slate-950 rounded-full mt-0.5" />
            )}
          </button>

          {/* Tab 4: Summary & Memo */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'summary'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">হিসাব ও মেমো</span>
            {activeTab === 'summary' && (
              <span className="w-4 h-0.5 bg-slate-950 rounded-full mt-0.5" />
            )}
          </button>
        </div>
      </nav>

      {/* Digital Memo Modal */}
      <DigitalMemoModal
        session={activeSession}
        buyer={activeBuyer}
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        onUpdateFarmName={handleUpdateFarmName}
      />

      {/* Edit Entry Modal */}
      <EditEntryModal
        entry={editingEntry}
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onSave={handleUpdateEntry}
      />

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        onCreateSession={handleCreateSession}
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={(id) => {
          setActiveSessionIdState(id);
          setActiveSessionId(id);
        }}
      />
    </div>
  );
}
