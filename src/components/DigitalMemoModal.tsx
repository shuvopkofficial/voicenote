import React, { useState } from 'react';
import { SalesSession, Buyer } from '../types';
import { convertAsciiToBengaliDigits, formatTaka, formatKgGrams } from '../utils/bengaliParser';
import { Printer, Share2, Copy, Check, X } from 'lucide-react';

interface DigitalMemoModalProps {
  session: SalesSession;
  buyer: Buyer;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFarmName: (name: string) => void;
}

export const DigitalMemoModal: React.FC<DigitalMemoModalProps> = ({
  session,
  buyer,
  isOpen,
  onClose,
  onUpdateFarmName,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [farmNameInput, setFarmNameInput] = useState(session.farmName || 'শুভ পোল্ট্রি খামার');

  if (!isOpen) return null;

  const buyerEntries = session.entries.filter((e) => e.buyerId === buyer.id);
  const totalGrossKg = buyerEntries.reduce((sum, e) => sum + e.grossKg, 0);
  const totalTareKg = buyerEntries.reduce((sum, e) => sum + e.tareKg, 0);
  const totalNetKg = buyerEntries.reduce((sum, e) => sum + e.netKg, 0);
  const totalAmount = buyerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
  const dueAmount = Math.max(0, totalAmount - (buyer.paidAmount || 0));

  const { textBn: netTextBn } = formatKgGrams(totalNetKg);

  const formattedDate = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Generate Bengali WhatsApp message text
  const generateWhatsAppText = () => {
    let msg = `*${session.farmName || 'শুভ পোল্ট্রি খামার'} - মুরগী বিক্রির মেমো*\n`;
    msg += `তারিখ: ${formattedDate}\n`;
    msg += `ক্রেতা: ${buyer.name}\n`;
    msg += `--------------------------------\n`;
    msg += `দাঁড়ির বিবরণ:\n`;

    buyerEntries.forEach((e) => {
      msg += `দাঁড়ি #${convertAsciiToBengaliDigits(e.dariNumber)}: ${convertAsciiToBengaliDigits(e.grossKg.toFixed(2))} কেজি (নিট: ${convertAsciiToBengaliDigits(e.netKg.toFixed(2))} কেজি)\n`;
    });

    msg += `--------------------------------\n`;
    msg += `মোট দাঁড়ি: ${convertAsciiToBengaliDigits(buyerEntries.length)} টি\n`;
    msg += `মোট খাঁচা বাদ: ${convertAsciiToBengaliDigits(totalTareKg.toFixed(1))} কেজি\n`;
    msg += `*সর্বমোট নিট ওজন: ${convertAsciiToBengaliDigits(totalNetKg.toFixed(2))} কেজি (${netTextBn})*\n`;
    msg += `দর: প্রতি কেজি ${convertAsciiToBengaliDigits(buyer.ratePerKg)} ৳\n`;
    msg += `*সর্বমোট বিল: ${formatTaka(totalAmount)}*\n`;
    if (buyer.paidAmount > 0) {
      msg += `নগদ জমা: ${formatTaka(buyer.paidAmount)}\n`;
    }
    if (dueAmount > 0) {
      msg += `*অবশিষ্ট বাকি: ${formatTaka(dueAmount)}*\n`;
    }
    msg += `\nধন্যবাদ!`;
    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    const phoneParam = buyer.phone ? `phone=${buyer.phone}&` : '';
    const url = `https://api.whatsapp.com/send?${phoneParam}text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyMemo = async () => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveFarmName = () => {
    onUpdateFarmName(farmNameInput);
    setIsEditingFarm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl my-auto text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 print:hidden transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="text-center pb-4 border-b border-slate-200">
          {isEditingFarm ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <input
                type="text"
                value={farmNameInput}
                onChange={(e) => setFarmNameInput(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-sm font-bold text-center text-slate-900"
                autoFocus
              />
              <button
                onClick={handleSaveFarmName}
                className="px-3.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                সংরক্ষণ
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 group">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {session.farmName || 'শুভ পোল্ট্রি খামার'}
              </h2>
              <button
                onClick={() => setIsEditingFarm(true)}
                className="text-xs text-slate-400 hover:text-slate-700 print:hidden ml-1"
                title="খামারের নাম পরিবর্তন করুন"
              >
                ✎
              </button>
            </div>
          )}
          <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
            মুরগী বিক্রির খাঁচা ও দাঁড়ি হিসাব মেমো
          </p>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-2">
            <span>তারিখ: {formattedDate}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>মেমো নং: #{session.id.slice(-5)}</span>
          </div>
        </div>

        {/* Customer & Rate Details */}
        <div className="py-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">ক্রেতা / পাইকার:</div>
            <div className="text-base font-bold text-slate-950">{buyer.name}</div>
            {buyer.phone && <div className="text-slate-500 text-xs">{buyer.phone}</div>}
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase font-bold">দর (রেট):</div>
            <div className="text-base font-extrabold font-mono text-slate-900">
              {convertAsciiToBengaliDigits(buyer.ratePerKg)} ৳ <span className="text-xs font-sans text-slate-500 font-medium">/কেজি</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">খাঁচা বাদ: {convertAsciiToBengaliDigits(buyer.defaultTareKg)} কেজি</div>
          </div>
        </div>

        {/* Weighing Table */}
        <div className="py-3">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>দাঁড়ির পূর্ণাঙ্গ তালিকা ({convertAsciiToBengaliDigits(buyerEntries.length)} টি):</span>
            <span className="font-mono text-slate-700 text-xs font-bold">ওজন (কেজি)</span>
          </div>

          <div className="max-h-56 overflow-y-auto print:max-h-none border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] text-slate-600 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2 px-3">দাঁড়ি নং</th>
                  <th className="py-2 px-3">মোট ওজন</th>
                  <th className="py-2 px-3">খাঁচা বাদ</th>
                  <th className="py-2 px-3 text-right">নিট ওজন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {buyerEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-800">
                      #{convertAsciiToBengaliDigits(e.dariNumber)}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {convertAsciiToBengaliDigits(e.grossKg.toFixed(2))}
                    </td>
                    <td className="py-2 px-3 text-amber-800 font-semibold">
                      {e.tareKg > 0 ? `-${convertAsciiToBengaliDigits(e.tareKg.toFixed(2))}` : '০.০০'}
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-slate-950">
                      {convertAsciiToBengaliDigits(e.netKg.toFixed(2))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Grand Totals */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs font-medium">
          <div className="flex justify-between text-slate-700">
            <span>সর্বমোট দাঁড়ি:</span>
            <span className="font-bold font-mono text-slate-900">{convertAsciiToBengaliDigits(buyerEntries.length)} টি</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>সর্বমোট নিট ওজন:</span>
            <span className="font-extrabold font-mono text-slate-950 text-sm">
              {convertAsciiToBengaliDigits(totalNetKg.toFixed(2))} কেজি ({netTextBn})
            </span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>দর: প্রতি কেজি</span>
            <span className="font-bold font-mono text-slate-900">{convertAsciiToBengaliDigits(buyer.ratePerKg)} ৳</span>
          </div>

          <div className="flex justify-between text-sm sm:text-base font-black text-slate-950 pt-1.5 border-t border-slate-200">
            <span>সর্বমোট বিল:</span>
            <span className="font-mono text-emerald-800">{formatTaka(totalAmount)}</span>
          </div>

          {buyer.paidAmount > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>নগদ জমা:</span>
              <span className="font-bold font-mono text-slate-900">{formatTaka(buyer.paidAmount)}</span>
            </div>
          )}

          {dueAmount > 0 && (
            <div className="flex justify-between text-amber-900 font-bold">
              <span>অবশিষ্ট বাকি:</span>
              <span className="font-mono">{formatTaka(dueAmount)}</span>
            </div>
          )}
        </div>

        {/* Modal Buttons (Hidden on Print) */}
        <div className="mt-5 pt-4 border-t border-slate-200 print:hidden grid grid-cols-3 gap-2">
          <button
            onClick={handleCopyMemo}
            className="min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
