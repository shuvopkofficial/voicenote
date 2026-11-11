import React, { useState } from 'react';
import { WeighingEntry } from '../types';
import { convertAsciiToBengaliDigits } from '../utils/bengaliParser';
import { X, Check } from 'lucide-react';

interface EditEntryModalProps {
  entry: WeighingEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: WeighingEntry) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !entry) return null;

  const [grossKg, setGrossKg] = useState(String(entry.grossKg));
  const [tareKg, setTareKg] = useState(String(entry.tareKg));
  const [ratePerKg, setRatePerKg] = useState(String(entry.ratePerKg));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(grossKg) || entry.grossKg;
    const t = parseFloat(tareKg) || 0;
    const r = parseFloat(ratePerKg) || entry.ratePerKg;
    const net = Math.max(0, g - t);
    const totalAmount = net * r;

    onSave({
      ...entry,
      grossKg: g,
      tareKg: t,
      netKg: net,
      ratePerKg: r,
      totalAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold mb-3 flex items-center gap-1.5 text-slate-950">
          <span>দাঁড়ি নং {convertAsciiToBengaliDigits(entry.dariNumber)} সম্পাদনা</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">মোট ওজন (কেজি)</label>
            <input
              type="number"
              step="0.01"
              value={grossKg}
              onChange={(e) => setGrossKg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">খাঁচার ওজন বাদ (কেজি)</label>
            <input
              type="number"
              step="0.1"
              value={tareKg}
              onChange={(e) => setTareKg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">দর (প্রতি কেজি টাকা)</label>
            <input
              type="number"
              value={ratePerKg}
              onChange={(e) => setRatePerKg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white flex items-center gap-1 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>আপডেট করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
