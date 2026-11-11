import React from 'react';
import { Mic, Radio, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceMicHeroProps {
  isListening: boolean;
  statusMessage: 'idle' | 'listening' | 'processing' | 'saved' | 'error';
  transcript: string;
  interimTranscript: string;
  onToggleListening: () => void;
  onSampleClick: (sampleText: string) => void;
  activeBuyerName: string;
}

export const VoiceMicHero: React.FC<VoiceMicHeroProps> = ({
  isListening,
  statusMessage,
  transcript,
  interimTranscript,
  onToggleListening,
  onSampleClick,
  activeBuyerName,
}) => {
  const samplePhrases = [
    `${activeBuyerName || 'নাইম'} ৩৫ কেজি ২০০ গ্রাম`,
    `করিম ৪২ কেজি ৫০০ গ্রাম দর ১৭০`,
    `দাঁড়ি ৩ বাবু ৩৮ কেজি আড়াইশ গ্রাম`,
    `৪০ কেজি ৭০০ গ্রাম`,
  ];

  return (
    <div
      className={`bg-white border rounded-2xl p-5 text-center relative overflow-hidden transition-all shadow-xs ${
        isListening
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : 'border-slate-200'
      }`}
    >
      {/* Top Status */}
      <div className="flex items-center justify-between gap-2 text-xs mb-3">
        <div className="flex items-center gap-2 font-semibold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isListening ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'
            }`}
          />
          <span className={isListening ? 'text-emerald-800 font-bold' : 'text-slate-600'}>
            {isListening ? 'হাতে স্পর্শ ছাড়া অটো লিসেনিং চালু' : 'ভয়েস বন্ধ আছে'}
          </span>
        </div>

        <span className="text-[11px] text-slate-500">
          ভাষা: <strong className="text-slate-700">বাংলা (বাংলাদেশ)</strong>
        </span>
      </div>

      {/* Main Microphone Button */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Subtle ripple waves when listening */}
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 animate-ping pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={onToggleListening}
            aria-label={isListening ? 'ভয়েস বন্ধ করুন' : 'ভয়েস শুরু করুন'}
            className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-md transition-all active:scale-95 ${
              isListening
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-4 ring-emerald-100'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/15'
            }`}
          >
            {isListening ? (
              <>
                <Radio className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce mb-1" />
                <span className="text-[11px] font-bold">শুনছি...</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                <span className="text-[11px] font-bold">ভয়েস অন করুন</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-3.5 text-xs sm:text-sm font-semibold text-slate-800">
          {isListening
            ? 'ফোনটি খাঁচার পাশে রাখুন এবং মুখে ওজন বলুন (অটো রেকর্ড হবে)'
            : 'মাইক্রোফোনে চাপ দিয়ে কথা বলা শুরু করুন (হাতে ধরা লাগবে না)'}
        </p>
      </div>

      {/* Error Notice */}
      {statusMessage === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-left max-w-lg mx-auto flex items-start gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">মাইক্রোফোন চালু করা যায়নি।</span>
            <p className="text-[11px] text-red-700 mt-0.5">
              আইফোনে ব্রাউজারের মাইক্রোফোন পারমিশন Allow আছে কি না চেক করুন, অথবা নিচের নমুনা বোতামে চাপ দিন।
            </p>
          </div>
        </div>
      )}

      {/* Spoken subtitle display */}
      {(interimTranscript || transcript) && (
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-lg mx-auto">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>যা শুনলাম:</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {interimTranscript ? (
              <span className="italic text-slate-500">{interimTranscript}...</span>
            ) : (
              <span className="text-emerald-800">"{transcript}"</span>
            )}
          </div>
        </div>
      )}

      {/* Quick sample chips */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 text-left">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>যেমন বলতে পারেন (বা টেস্ট করতে ট্যাপ করুন):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => onSampleClick(phrase)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 whitespace-nowrap shrink-0 transition-colors active:scale-95"
            >
              "{phrase}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
