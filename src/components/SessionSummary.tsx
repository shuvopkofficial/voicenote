import React from 'react';
import { SalesSession } from '../types';
import { convertAsciiToBengaliDigits, formatTaka, formatKgGrams } from '../utils/bengaliParser';
import { FileText, Share2, Calculator, TrendingUp, Layers } from 'lucide-react';

interface SessionSummaryProps {
  session: SalesSession;
  onOpenMemo: () => void;
  onShareWhatsApp: () => void;
  activeBuyerId: string;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  session,
  onOpenMemo,
  onShareWhatsApp,
  activeBuyerId,
}) => {
  const activeBuyer = session.buyers[activeBuyerId];
  const buyerEntries = session.entries.filter((e) => e.buyerId === activeBuyerId);

  // Active buyer metrics
  const buyerGrossKg = buyerEntries.reduce((sum, e) => sum + e.grossKg, 0);
  const buyerTareKg = buyerEntries.reduce((sum, e) => sum + e.tareKg, 0);
  const buyerNetKg = buyerEntries.reduce((sum, e) => sum + e.netKg, 0);
  const buyerTotalAmount = buyerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
  const buyerPaid = activeBuyer?.paidAmount || 0;
  const buyerDue = Math.max(0, buyerTotalAmount - buyerPaid);
  const buyerAvgDariKg = buyerEntries.length > 0 ? buyerNetKg / buyerEntries.length : 0;

  // Session-wide metrics (all buyers combined)
  const allNetKg = session.entries.reduce((sum, e) => sum + e.netKg, 0);

  const { textBn: netTextBn } = formatKgGrams(buyerNetKg);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-emerald-700" />
          <span>হিসাব সারাংশ ({activeBuyer?.name || 'ক্রেতা'})</span>
        </h3>
        <span className="text-xs text-slate-500">
          সর্বমোট খামারের বিক্রি: <strong className="text-slate-900 font-mono font-bold">{convertAsciiToBengaliDigits(allNetKg.toFixed(1))} কেজি</strong>
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {/* Total Weighings */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mb-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>মোট দাঁড়ি/খাঁচা</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 tabular-nums">
            {convertAsciiToBengaliDigits(buyerEntries.length)}
            <span className="text-xs font-sans text-slate-500 ml-1 font-semibold">টি</span>
          </div>
        </div>

        {/* Total Net Weight */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-700" />
            <span>মোট নিট ওজন</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-950 tabular-nums">
            {convertAsciiToBengaliDigits(buyerNetKg.toFixed(2))}
            <span className="text-xs font-sans text-slate-500 ml-1 font-semibold">কেজি</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
            {netTextBn}
          </div>
        </div>

        {/* Average per Lot */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-semibold mb-1">গড় দাঁড়ি ওজন</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 tabular-nums">
            {convertAsciiToBengaliDigits(buyerAvgDariKg.toFixed(2))}
            <span className="text-xs font-sans text-slate-500 ml-1 font-semibold">কেজি</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
            প্রতি খাঁচায় গড়
          </div>
        </div>

        {/* Total Bill */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="text-[11px] text-emerald-800 font-bold mb-1">মোট বিল</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-900 tabular-nums">
            {formatTaka(buyerTotalAmount)}
          </div>
          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
            দর: {convertAsciiToBengaliDigits(activeBuyer?.ratePerKg || 0)} ৳
          </div>
        </div>
      </div>

      {/* Payment & Balance Row */}
      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl mb-4 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>
            নগদ জমা: <strong className="text-slate-900 font-mono font-bold">{formatTaka(buyerPaid)}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            বাকি: <strong className="text-amber-800 font-mono font-bold">{formatTaka(buyerDue)}</strong>
          </span>
        </div>
        <div className="text-slate-500 text-[11px] font-medium">
          (খাঁচা বাদ: <span className="font-mono text-slate-700 font-bold">{convertAsciiToBengaliDigits(buyerTareKg.toFixed(1))} কেজি</span>)
        </div>
      </div>

      {/* Action Buttons: Digital Memo and WhatsApp */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenMemo}
          className="min-h-[46px] rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 shadow-xs active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4 text-slate-700" />
          <span>ডিজিটাল মেমো / রসিদ</span>
        </button>

        <button
          onClick={onShareWhatsApp}
          className="min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>হোয়াটসঅ্যাপে পাঠান</span>
        </button>
      </div>
    </div>
  );
};
