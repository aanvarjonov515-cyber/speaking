import React, { useState, useEffect } from 'react';
import {
  Clock,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  Flame,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { UserProgressData } from '../../types';
import { DBService } from '../../services/database/dbService';

export const ProgressView: React.FC = () => {
  const [progress, setProgress] = useState<UserProgressData>(DBService.getProgress());
  const texts = DBService.getReadingTexts();

  useEffect(() => {
    setProgress(DBService.getProgress());
  }, []);

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col h-full p-8 max-w-6xl mx-auto space-y-6 text-slate-100 overflow-y-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">Oʻqish Samaradorligi (Reading Progress)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Har kungi oʻqish vaqti, oʻzlashtirilgan soʻzlar va darajangiz oʻsishi
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Bugungi oʻqish</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {progress.todayReadingMinutes} <span className="text-xs font-normal text-slate-400">daqiqa</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Haftalik: {formatHours(progress.weeklyMinutes)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Oʻrganilgan soʻzlar</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {progress.wordsExplored}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Saqlangan: {progress.savedWordsCount} ta
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tugatilgan matnlar</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {progress.textsCompleted}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Jami sessiyalar: {texts.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Hozirgi Daraja</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {progress.currentLevel}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>{progress.dailyStreak} kunlik seriya</span>
          </div>
        </div>
      </div>

      {/* Reading History Sessions List */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Oxirgi Oʻqish Sessiyalari</h2>
        <div className="divide-y divide-slate-800/80">
          {texts.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200">{t.title}</span>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-indigo-400 font-semibold">
                    {t.level}
                  </span>
                  <span>·</span>
                  <span>{t.topic}</span>
                  <span>·</span>
                  <span>{t.sentences.length} ta gap</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-emerald-400 font-semibold">
                  {t.progressPercent}% yakunlangan
                </span>
                <div className="text-[10px] text-slate-500">
                  {new Date(t.lastReadAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
