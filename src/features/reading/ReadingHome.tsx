import React from 'react';
import {
  Sparkles,
  PenTool,
  Upload,
  BookOpen,
  ArrowRight,
  Clock,
  Play,
  Film,
  FileText,
  Bookmark,
} from 'lucide-react';
import { ReadingText } from '../../types';

interface ReadingHomeProps {
  texts: ReadingText[];
  activeText: ReadingText | null;
  onOpenText: (text: ReadingText) => void;
  onOpenCreateModal: () => void;
  onOpenAddModal: () => void;
  onOpenUploadVideo: () => void;
}

export const ReadingHome: React.FC<ReadingHomeProps> = ({
  texts,
  activeText,
  onOpenText,
  onOpenCreateModal,
  onOpenAddModal,
  onOpenUploadVideo,
}) => {
  return (
    <div className="flex flex-col h-full p-8 max-w-6xl mx-auto space-y-8 text-slate-100 overflow-y-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/40 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <span>Reading Studio</span>
            <span>·</span>
            <span>VRM 3D Teacher</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Ingliz tili matnlarini tabiiy tushunish va oʻrganish
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            AI oʻqituvchingiz matnni ovoz chiqarib oʻqib beradi, tushunarsiz soʻzlarni Oʻzbek tilida tushuntiradi
            va grammatikasini tahlil qiladi.
          </p>
        </div>
      </div>

      {/* 3 Primary Ways to Start Reading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Method 1: Create with AI */}
        <div
          onClick={onOpenCreateModal}
          className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/60 shadow-xl cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Create with AI</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Mavzu va CEFR darajangizni tanlang (A1–C1). AI siz uchun qiziqarli va tabiiy inglizcha matn yaratadi.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold group-hover:gap-2.5 transition-all">
            <span>Matn yaratish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Method 2: Add My Text */}
        <div
          onClick={onOpenAddModal}
          className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/60 shadow-xl cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PenTool className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Add My Text</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Oʻzingizning matningizni kiriting. AI darajani (A2, B1...) avtomatik aniqlaydi va oʻrganishga tayyorlaydi.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold group-hover:gap-2.5 transition-all">
            <span>Matn qoʻshish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Method 3: Upload Video or Media */}
        <div
          onClick={onOpenUploadVideo}
          className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/60 shadow-xl cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Film className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Video & Media Reading</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            MP4/WebM video yuklang va interaktiv subtitrlar bilan birga oʻqituvchi yordamida oʻrganing.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold group-hover:gap-2.5 transition-all">
            <span>Video yuklash</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Continue Reading Card */}
      {activeText && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Continue Reading
              </span>
              <span className="text-slate-500">·</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold">
                {activeText.level}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{activeText.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
              Oxirgi oʻqilgan gap: "{activeText.sentences[activeText.currentSentenceIndex]?.text || ''}"
            </p>
          </div>

          <button
            onClick={() => onOpenText(activeText)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Davom ettirish</span>
          </button>
        </div>
      )}

      {/* Reading History & Text Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-200">Barcha Matnlar Kutubxonasi</h2>
          <span className="text-xs text-slate-500 font-mono">{texts.length} ta matn</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {texts.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenText(item)}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-900 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono text-xs font-bold">
                    {item.level}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-medium">
                  {item.progressPercent}%
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.content}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{item.topic}</span>
                <span>{item.sentences.length} gap</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
