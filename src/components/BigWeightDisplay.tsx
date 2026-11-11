import React from 'react';
import { WeighingEntry } from '../types';
import { convertAsciiToBengaliDigits, formatTaka, formatKgGrams } from '../utils/bengaliParser';
import { RotateCcw, Scale, CheckCircle2, User, Sparkles } from 'lucide-react';

interface BigWeightDisplayProps {
  latestEntry: WeighingEntry | null;
  onUndoLatest: () => void;
  totalEntriesCount: number;
  activeBuyerName: string;
}

export const BigWeightDisplay: React.FC<BigWeightDisplayProps> = ({
  latestEntry,
  onUndoLatest,
  activeBuyerName,
}) => {
  if (!latestEntry) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>দাঁড়ির পাশে কথা বলুন</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              শুধু মুখে বলুন: <span className="text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 font-bold">"{activeBuyerName || 'নাইম'} ৩৫ কেজি ২০০ গ্রাম"</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              অ্যাপটি স্বয়ংক্রিয়ভাবে খাঁচা/দাঁড়ি লিখে নিবে এবং মোট হিসাব যোগ করবে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { textBn: grossTextBn } = formatKgGrams(latestEntry.grossKg);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* Top row: Dāri index, Buyer name, Undo button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>দাঁড়ি নং {convertAsciiToBengaliDigits(latestEntry.dariNumber)}</span>
          </span>

          <span className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{latestEntry.buyerName}</span>
          </span>
        </div>

        {/* Undo button */}
        <button
          onClick={onUndoLatest}
          title="এই শেষ দাঁড়িটি বাতিল করুন"
          className="min-h-[36px] px-3 py-1 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ভুল হলে বাতিল</span>
        </button>
      </div>

      {/* Massive weight display: readable from 5-10 feet away next to the scale! */}
      <div className="my-2 bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          সর্বশেষ রেকর্ডকৃত মোট ওজন (দাঁড়ি)
        </div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <div className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums font-mono text-slate-950">
            {convertAsciiToBengaliDigits(latestEntry.grossKg.toFixed(2))}
            <span className="text-xl sm:text-2xl font-bold font-sans ml-1 text-slate-600">কেজি</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-700">
            ({grossTextBn})
          </div>
        </div>
      </div>

      {/* Breakdown footer: Tare, Net, Rate */}
      <div className="pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-3 text-slate-600">
          {latestEntry.tareKg > 0 && (
            <span>
              খাঁচা বাদ: <strong className="text-amber-800 font-mono">{convertAsciiToBengaliDigits(latestEntry.tareKg.toFixed(2))} কেজি</strong>
            </span>
          )}
          <span>
            নিট ওজন: <strong className="text-emerald-800 font-mono text-sm font-bold">{convertAsciiToBengaliDigits(latestEntry.netKg.toFixed(2))} কেজি</strong>
          </span>
        </div>

        {latestEntry.ratePerKg > 0 && (
          <div className="font-bold text-slate-900 font-mono text-xs">
            দর: {convertAsciiToBengaliDigits(latestEntry.ratePerKg)} ৳ · {formatTaka(latestEntry.totalAmount)}
          </div>
        )}
      </div>
    </div>
  );
};
