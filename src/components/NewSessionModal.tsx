import React, { useState } from 'react';
import { SalesSession } from '../types';
import { convertAsciiToBengaliDigits } from '../utils/bengaliParser';
import { X, Plus, Calendar, History } from 'lucide-react';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (title: string, farmName: string, defaultBuyerName: string) => void;
  sessions: Record<string, SalesSession>;
  activeSessionId: string;
  onSelectSession: (id: string) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
  sessions,
  activeSessionId,
  onSelectSession,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(
    `আজকের মুরগী বিক্রি - ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}`
  );
  const [farmName, setFarmName] = useState('শুভ পোল্ট্রি খামার');
  const [buyerName, setBuyerName] = useState('নাইম');

  const sessionList = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateSession(title.trim(), farmName.trim(), buyerName.trim() || 'নাইম');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 text-slate-900 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-950">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <span>বিক্রি সেশন ও পূর্বের খাতা</span>
        </h3>

        {/* Create new session form */}
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 space-y-3 text-xs">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>নতুন বিক্রি খাতা শুরু করুন</span>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">খাতার নাম / বিবরণ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">খামারের নাম</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">প্রথম ক্রেতার নাম</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন খাতা তৈরি করুন</span>
          </button>
        </form>

        {/* Previous sessions list */}
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>পূর্বের সংরক্ষিত বিক্রি খাতা ({convertAsciiToBengaliDigits(sessionList.length)} টি):</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {sessionList.map((s) => {
              const isCurrent = s.id === activeSessionId;
              const totalKg = s.entries.reduce((sum, e) => sum + e.netKg, 0);

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{s.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-300 font-medium">(বর্তমান)</span>
                      )}
                    </div>
                    <div className={`text-[11px] font-medium ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                      {convertAsciiToBengaliDigits(s.entries.length)} দাঁড়ি · {convertAsciiToBengaliDigits(Object.keys(s.buyers).length)} জন ক্রেতা
                    </div>
                  </div>

                  <div className={`text-right font-mono text-xs font-bold ${isCurrent ? 'text-emerald-300' : 'text-slate-900'}`}>
                    {convertAsciiToBengaliDigits(totalKg.toFixed(1))} কেজি
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
