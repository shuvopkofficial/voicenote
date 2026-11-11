import React, { useState } from 'react';
import { WeighingEntry } from '../types';
import { convertAsciiToBengaliDigits, formatTaka } from '../utils/bengaliParser';
import { Trash2, Edit3, Filter, Clock } from 'lucide-react';

interface DariListProps {
  entries: WeighingEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: WeighingEntry) => void;
  activeBuyerId: string;
  activeBuyerName: string;
}

export const DariList: React.FC<DariListProps> = ({
  entries,
  onDeleteEntry,
  onEditEntry,
  activeBuyerId,
  activeBuyerName,
}) => {
  const [showOnlyActiveBuyer, setShowOnlyActiveBuyer] = useState(false);

  const displayedEntries = showOnlyActiveBuyer
    ? entries.filter((e) => e.buyerId === activeBuyerId)
    : entries;

  // Sorted reverse chronologically (latest dāri on top)
  const sorted = [...displayedEntries].sort((a, b) => b.timestamp - a.timestamp);

  const totalKg = sorted.reduce((sum, e) => sum + e.netKg, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* Table Header controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            দাঁড়ির তালিকা
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
            {convertAsciiToBengaliDigits(sorted.length)} টি
          </span>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowOnlyActiveBuyer(!showOnlyActiveBuyer)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
            showOnlyActiveBuyer
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>{showOnlyActiveBuyer ? `শুধু ${activeBuyerName}` : 'সব ক্রেতা'}</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
          <p className="mb-1 font-semibold text-slate-700">এখনও কোনো দাঁড়ি রেকর্ড করা হয়নি</p>
          <p className="text-slate-500 text-xs">
            মাইক অন করে বলুন <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">"{activeBuyerName} ৩৫ কেজি ২০০ গ্রাম"</span> অথবা টাচ কিপ্যাড দিয়ে যোগ করুন
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {sorted.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString('bn-BD', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 transition-all flex items-center justify-between gap-2 shadow-2xs"
              >
                {/* Left: Dari # & Buyer */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                    {convertAsciiToBengaliDigits(item.dariNumber)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm truncate text-slate-900">
                        {item.buyerName}
                      </span>
                      {item.birdCount && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({convertAsciiToBengaliDigits(item.birdCount)}টি)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeStr}</span>
                      {item.tareKg > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-amber-800 font-semibold">খাঁচা -{convertAsciiToBengaliDigits(item.tareKg)}kg</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Weight, Rate & Actions */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <div className="text-sm sm:text-base font-extrabold font-mono text-slate-950 tabular-nums">
                      {convertAsciiToBengaliDigits(item.netKg.toFixed(2))} <span className="text-xs font-sans text-slate-500 font-semibold">কেজি</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold font-mono">
                      {item.ratePerKg > 0 ? (
                        <span>{formatTaka(item.totalAmount)}</span>
                      ) : (
                        <span>মোট: {convertAsciiToBengaliDigits(item.grossKg.toFixed(2))}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEntry(item)}
                      title="সম্পাদনা করুন"
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(item.id)}
                      title="মুছে ফেলুন"
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Total count */}
      {sorted.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>মোট দেখানো হয়েছে: {convertAsciiToBengaliDigits(sorted.length)} দাঁড়ি</span>
          <span className="font-bold text-slate-900 font-mono">
            সর্বমোট নিট: {convertAsciiToBengaliDigits(totalKg.toFixed(2))} কেজি
          </span>
        </div>
      )}
    </div>
  );
};
