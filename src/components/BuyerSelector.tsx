import React, { useState } from 'react';
import { Buyer, WeighingEntry } from '../types';
import { convertAsciiToBengaliDigits } from '../utils/bengaliParser';
import { User, Plus, Edit2, Check } from 'lucide-react';

interface BuyerSelectorProps {
  buyers: Record<string, Buyer>;
  activeBuyerId: string;
  onSelectBuyer: (buyerId: string) => void;
  onAddBuyer: (name: string, rate: number, tare: number, phone?: string) => void;
  onUpdateBuyer: (buyer: Buyer) => void;
  entries: WeighingEntry[];
}

export const BuyerSelector: React.FC<BuyerSelectorProps> = ({
  buyers,
  activeBuyerId,
  onSelectBuyer,
  onAddBuyer,
  onUpdateBuyer,
  entries,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('165');
  const [newTare, setNewTare] = useState('2.2');
  const [newPhone, setNewPhone] = useState('');
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');
  const [editPaid, setEditPaid] = useState('');

  const buyerList = Object.values(buyers);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddBuyer(
      newName.trim(),
      parseFloat(newRate) || 165,
      parseFloat(newTare) || 2.2,
      newPhone.trim() || undefined
    );
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const startEdit = (buyer: Buyer) => {
    setEditingBuyerId(buyer.id);
    setEditRate(String(buyer.ratePerKg));
    setEditPaid(String(buyer.paidAmount));
  };

  const saveEdit = (buyer: Buyer) => {
    onUpdateBuyer({
      ...buyer,
      ratePerKg: parseFloat(editRate) || buyer.ratePerKg,
      paidAmount: parseFloat(editPaid) || 0,
    });
    setEditingBuyerId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>ক্রেতা / পাইকার নির্বাচন:</span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3 text-emerald-700" />
            <span>নতুন ক্রেতা</span>
          </button>
        )}
      </div>

      {/* New Buyer Quick Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 space-y-2">
          <div className="text-xs font-bold text-slate-900">নতুন ক্রেতা যোগ করুন</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="নাম (যেমন: নাইম)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
              autoFocus
            />
            <input
              type="number"
              placeholder="দর (যেমন: ১৬৫)"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="খাঁচা বাদ (২.২)"
              value={newTare}
              onChange={(e) => setNewTare(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
            />
            <input
              type="tel"
              placeholder="মোবাইল (ঐচ্ছিক)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs"
            >
              যোগ করুন
            </button>
          </div>
        </form>
      )}

      {/* Buyer Horizontal Scroller / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {buyerList.map((buyer) => {
          const isActive = buyer.id === activeBuyerId;
          const buyerEntries = entries.filter((e) => e.buyerId === buyer.id);
          const buyerTotalKg = buyerEntries.reduce((sum, e) => sum + e.netKg, 0);

          return (
            <button
              key={buyer.id}
              onClick={() => onSelectBuyer(buyer.id)}
              className={`p-3 rounded-xl border text-left shrink-0 min-w-[135px] transition-all relative ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-sm truncate">{buyer.name}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </div>

              <div className={`flex items-center justify-between text-xs font-semibold ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                <span>{convertAsciiToBengaliDigits(buyerEntries.length)} দাঁড়ি</span>
                <span className={`font-mono ${isActive ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {convertAsciiToBengaliDigits(buyerTotalKg.toFixed(1))} কেজি
                </span>
              </div>

              <div className={`text-[11px] mt-1 flex items-center justify-between ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>দর: {convertAsciiToBengaliDigits(buyer.ratePerKg)} ৳</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(buyer);
                  }}
                  title="দর ও জমা এডিট করুন"
                  className={`p-1 rounded hover:bg-white/10 ${isActive ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  <Edit2 className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Edit Buyer Drawer */}
      {editingBuyerId && (
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          {(() => {
            const b = buyers[editingBuyerId];
            if (!b) return null;
            return (
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>{b.name} এর দর ও জমা আপডেট</span>
                  <button
                    onClick={() => setEditingBuyerId(null)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">প্রতি কেজি দর (টাকা)</label>
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">নগদ জমা (টাকা)</label>
                    <input
                      type="number"
                      value={editPaid}
                      onChange={(e) => setEditPaid(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => saveEdit(b)}
                    className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
