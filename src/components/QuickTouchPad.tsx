import React, { useState } from 'react';
import { convertAsciiToBengaliDigits } from '../utils/bengaliParser';
import { Delete, Check, Box } from 'lucide-react';

interface QuickTouchPadProps {
  onAddEntry: (data: {
    kg: number;
    grams: number;
    tareKg: number;
    dariNumber?: number;
    birdCount?: number;
  }) => void;
  nextDariNumber: number;
  activeBuyerName: string;
  defaultTareKg: number;
}

export const QuickTouchPad: React.FC<QuickTouchPadProps> = ({
  onAddEntry,
  nextDariNumber,
  activeBuyerName,
  defaultTareKg,
}) => {
  const [kgInput, setKgInput] = useState('');
  const [gramInput, setGramInput] = useState('0');
  const [tareKg, setTareKg] = useState(defaultTareKg);
  const [birdCount, setBirdCount] = useState<string>('');

  const handleNumClick = (val: string) => {
    if (kgInput.length >= 5) return;
    setKgInput((prev) => (prev === '0' && val !== '.' ? val : prev + val));
  };

  const handleDelete = () => {
    setKgInput((prev) => prev.slice(0, -1));
  };

  const handleQuickKg = (amount: number) => {
    setKgInput(String(amount));
  };

  const handleQuickGram = (amount: number) => {
    setGramInput(String(amount));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const kg = parseFloat(kgInput);
    if (!kg || isNaN(kg) || kg <= 0) return;

    const grams = parseInt(gramInput, 10) || 0;
    const birds = birdCount ? parseInt(birdCount, 10) : undefined;

    onAddEntry({
      kg,
      grams,
      tareKg,
      dariNumber: nextDariNumber,
      birdCount: birds,
    });

    // Reset inputs for next dāri
    setKgInput('');
    setGramInput('0');
    setBirdCount('');
  };

  const currentGross = parseFloat(kgInput || '0') + (parseInt(gramInput || '0', 10) / 1000);
  const currentNet = Math.max(0, currentGross - tareKg);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span>দ্রুত টাচ কিপ্যাড</span>
          <span className="text-xs text-slate-500 font-normal">
            (দাঁড়ি নং {convertAsciiToBengaliDigits(nextDariNumber)} · {activeBuyerName})
          </span>
        </h3>
        <span className="text-xs text-emerald-800 font-mono font-bold">
          নিট: {convertAsciiToBengaliDigits(currentNet.toFixed(2))} কেজি
        </span>
      </div>

      {/* Screen Readout Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">ওজন ইনপুট</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
            {kgInput ? convertAsciiToBengaliDigits(kgInput) : '০'}
            <span className="text-sm text-slate-600 font-sans ml-1 font-semibold">কেজি</span>
            {gramInput !== '0' && (
              <>
                <span className="mx-1.5 text-slate-400">·</span>
                <span>{convertAsciiToBengaliDigits(gramInput)}</span>
                <span className="text-sm text-slate-600 font-sans ml-1 font-semibold">গ্রাম</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          type="button"
          aria-label="মুছুন"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 shadow-xs"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Quick KG chips */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold text-slate-600 mb-1.5 block">দ্রুত কেজি সেট করুন:</span>
        <div className="grid grid-cols-5 gap-1.5">
          {[25, 30, 35, 38, 40].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleQuickKg(k)}
              className={`min-h-[40px] text-xs font-bold rounded-lg border transition-all ${
                kgInput === String(k)
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200/80 hover:bg-slate-200/70'
              }`}
            >
              {convertAsciiToBengaliDigits(k)} কেজি
            </button>
          ))}
        </div>
      </div>

      {/* Quick Gram chips */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold text-slate-600 mb-1.5 block">গ্রাম সেট করুন:</span>
        <div className="grid grid-cols-5 gap-1.5">
          {[0, 100, 200, 250, 500].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleQuickGram(g)}
              className={`min-h-[38px] text-xs font-bold rounded-lg border transition-all ${
                gramInput === String(g)
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 text-slate-800 border-slate-200/80 hover:bg-slate-200/70'
              }`}
            >
              {g === 0 ? '০ গ্রাম' : `${convertAsciiToBengaliDigits(g)} গ্রাম`}
            </button>
          ))}
        </div>
      </div>

      {/* Crate Tare Selector */}
      <div className="mb-3.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-700" />
            <span>খাঁচার ওজন বাদ (টের):</span>
          </span>
          <span className="text-xs font-bold text-amber-800 font-mono">
            {convertAsciiToBengaliDigits(tareKg.toFixed(2))} কেজি বাদ
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'খাঁচা ছাড়া (০)', val: 0 },
            { label: '২.০ কেজি', val: 2.0 },
            { label: '২.২ কেজি', val: 2.2 },
            { label: '২.৫ কেজি', val: 2.5 },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setTareKg(item.val)}
              className={`min-h-[36px] text-[11px] font-bold rounded-lg border transition-all ${
                tareKg === item.val
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numpad Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleNumClick(digit)}
            className="min-h-[50px] rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-mono text-xl font-bold border border-slate-200 shadow-xs active:scale-95 transition-transform"
          >
            {convertAsciiToBengaliDigits(digit)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setKgInput('');
            setGramInput('0');
          }}
          className="min-h-[50px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold border border-slate-200"
        >
          ক্লিয়ার
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={!kgInput || parseFloat(kgInput) <= 0}
        onClick={() => handleSubmit()}
        className="w-full min-h-[50px] rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
      >
        <Check className="w-5 h-5" />
        <span>দাঁড়ি যোগ করুন ({convertAsciiToBengaliDigits(nextDariNumber)} নং)</span>
      </button>
    </div>
  );
};
