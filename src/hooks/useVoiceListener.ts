import { useState, useEffect, useRef, useCallback } from 'react';
import { playSuccessChime, playErrorTone, speakBengali } from '../utils/audioFeedback';

interface UseVoiceListenerOptions {
  onParsedResult: (transcript: string) => void;
  voiceLang?: string; // default 'bn-BD'
  isContinuous?: boolean;
  enableTTSFeedback?: boolean;
}

export function useVoiceListener({
  onParsedResult,
  voiceLang = 'bn-BD',
  isContinuous = true,
  enableTTSFeedback = true,
}: UseVoiceListenerOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<'idle' | 'listening' | 'processing' | 'saved' | 'error'>('idle');
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const recognitionRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const isContinuousActiveRef = useRef(isContinuous);
  const restartTimerRef = useRef<any>(null);

  // Keep ref updated
  useEffect(() => {
    isContinuousActiveRef.current = isContinuous;
  }, [isContinuous]);

  // Request screen wake lock so iPhone 12 Pro doesn't turn off screen
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.warn('Wake lock not supported or failed:', err);
      setWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
    } catch {}
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang; // 'bn-BD' for Bangladeshi Bengali
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('listening');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalPhrase += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalPhrase.trim()) {
          setTranscript(finalPhrase);
          setInterimTranscript('');
          setStatusMessage('processing');

          // Notify handler
          onParsedResult(finalPhrase.trim());

          // Visual feedback
          setTimeout(() => {
            setStatusMessage('saved');
            setTimeout(() => {
              if (isListening) setStatusMessage('listening');
            }, 1500);
          }, 300);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'no-speech') {
          // Normal when silent near scale
          return;
        }
        if (event.error === 'not-allowed') {
          setStatusMessage('error');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if continuous mode is still desired (keeps listening hands-free!)
        if (isContinuousActiveRef.current && isListening) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch {
              // Might already be active
            }
          }, 400);
        } else {
          setIsListening(false);
          setStatusMessage('idle');
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      releaseWakeLock();
    };
  }, [voiceLang, onParsedResult, isListening, releaseWakeLock]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;
    try {
      await requestWakeLock();
      recognitionRef.current.lang = voiceLang;
      recognitionRef.current.start();
      setIsListening(true);
      setStatusMessage('listening');
    } catch (err: any) {
      // If already started, ignore
      if (err.name !== 'InvalidStateError') {
        console.warn('Start listening error:', err);
      }
    }
  }, [requestWakeLock, voiceLang]);

  // Stop listening
  const stopListening = useCallback(() => {
    isContinuousActiveRef.current = false;
    clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setStatusMessage('idle');
    releaseWakeLock();
  }, [releaseWakeLock]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      isContinuousActiveRef.current = isContinuous;
      startListening();
    }
  }, [isListening, isContinuous, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    statusMessage,
    wakeLockActive,
    startListening,
    stopListening,
    toggleListening,
  };
}
