import React from 'react';
import { Cloud, CloudOff, Volume2, VolumeX, Smartphone, Plus } from 'lucide-react';

interface HeaderProps {
  isCloudSynced: boolean;
  isFirebaseActive: boolean;
  voiceTTS: boolean;
  setVoiceTTS: (val: boolean) => void;
  wakeLockActive: boolean;
  onNewSession: () => void;
  sessionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  isCloudSynced,
  voiceTTS,
  setVoiceTTS,
  wakeLockActive,
  onNewSession,
  sessionTitle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand wordmark - Clean Minimalist White */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs shrink-0">
            <span className="text-xl leading-none">🐔</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-900 truncate">
              মুরগী দাঁড়ি খাতা
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="truncate max-w-[140px] text-slate-700 font-medium">
                {sessionTitle}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                {isCloudSynced ? (
                  <span className="text-emerald-700 flex items-center gap-0.5 font-medium">
                    <Cloud className="w-3 h-3" />
                    <span>ক্লাউড</span>
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                    <CloudOff className="w-3 h-3" />
                    <span>অফলাইন</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Screen Wake Lock badge */}
          {wakeLockActive && (
            <span
              title="স্ক্রিন অন রাখা আছে"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg font-medium"
            >
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>স্ক্রিন সজাগ</span>
            </span>
          )}

          {/* Bengali Voice Readback Toggle */}
          <button
            onClick={() => setVoiceTTS(!voiceTTS)}
            title={voiceTTS ? 'ভয়েস বলা চালু (অন)' : 'ভয়েস বলা বন্ধ (অফ)'}
            aria-label="ভয়েস বলা টগল"
            className={`min-h-[38px] px-2.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold border transition-all ${
              voiceTTS
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
          >
            {voiceTTS ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden xs:inline">{voiceTTS ? 'ভয়েস অন' : 'ভয়েস অফ'}</span>
          </button>

          {/* New Session Button */}
          <button
            onClick={onNewSession}
            className="min-h-[38px] px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন খাতা</span>
          </button>
        </div>
      </div>
    </header>
  );
};
