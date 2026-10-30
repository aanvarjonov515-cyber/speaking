import React from 'react';
import { Minus, Square, X, Bell, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';

export type MainStudyTab = 'curriculum' | 'reading' | 'speaking' | 'writing';

interface WindowHeaderProps {
  currentStudyTab: MainStudyTab;
  onSelectStudyTab: (tab: MainStudyTab) => void;
  notification: string | null;
  onDismissNotification: () => void;
  onOpenSettings: () => void;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  currentStudyTab,
  onSelectStudyTab,
  notification,
  onDismissNotification,
  onOpenSettings,
}) => {
  return (
    <header className="h-11 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-4 select-none shrink-0 z-40">
      {/* Desktop Window Controls (macOS style decorative dots) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 mr-3">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition-colors" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors" />
        </div>
        <span className="text-xs font-semibold text-slate-400 tracking-tight hidden sm:inline">
          English AI Teacher
        </span>
      </div>

      {/* Central Primary Learning Tabs: CURRICULUM | READING | SPEAKING | WRITING */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          onClick={() => onSelectStudyTab('curriculum')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentStudyTab === 'curriculum'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>O'QUV DASTURI</span>
        </button>

        <button
          onClick={() => onSelectStudyTab('reading')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentStudyTab === 'reading'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          READING
        </button>

        <button
          onClick={() => onSelectStudyTab('speaking')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentStudyTab === 'speaking'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SPEAKING
        </button>

        <button
          onClick={() => onSelectStudyTab('writing')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentStudyTab === 'writing'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          WRITING
        </button>
      </div>

      {/* Right Notification Pill & Controls */}
      <div className="flex items-center gap-3">
        {notification && (
          <div
            onClick={onDismissNotification}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-200 text-xs cursor-pointer animate-in fade-in max-w-xs truncate"
            title="Click to dismiss"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{notification}</span>
          </div>
        )}
      </div>
    </header>
  );
};
