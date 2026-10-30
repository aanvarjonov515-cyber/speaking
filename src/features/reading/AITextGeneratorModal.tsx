import React, { useState } from 'react';
import { Sparkles, X, Loader2, BookOpen, Clock, Tag } from 'lucide-react';
import { CEFRLevel, ReadingText } from '../../types';
import { aiService } from '../../services/ai/aiService';

interface AITextGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (text: ReadingText) => void;
}

const POPULAR_TOPICS = [
  'Technology & AI',
  'University Life',
  'Daily Routines',
  'Programming & Coding',
  'Travel Adventures',
  'Food & Culture',
  'Business & Startups',
  'Space & Science',
];

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LENGTHS = ['Short', 'Medium', 'Long'];

export const AITextGeneratorModal: React.FC<AITextGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [topic, setTopic] = useState('Technology & AI');
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [length, setLength] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const selectedTopic = customTopic.trim() || topic;

    try {
      const generated = await aiService.createReadingText({
        topic: selectedTopic,
        level,
        length,
      });

      const newText: ReadingText = {
        id: 'text_' + Date.now(),
        title: generated.title || `${selectedTopic} (${level})`,
        topic: generated.topic || selectedTopic,
        level: (generated.level as CEFRLevel) || level,
        content: generated.content || '',
        sentences: (generated.sentences || []).map((s: string, idx: number) => ({
          id: idx,
          text: s,
        })),
        sourceType: 'ai',
        createdAt: Date.now(),
        lastReadAt: Date.now(),
        progressPercent: 0,
        currentSentenceIndex: 0,
      };

      onCreated(newText);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Matn yaratishda xatolik yuz berdi. Qayta urinib koʻring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Create Reading with AI</h2>
              <p className="text-xs text-slate-400">Darajangizga mos tabiiy inglizcha matn yaratish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Topic Selection */}
          <div className="space-y-2">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mavzuni tanlang yoki oʻzingiz yozing</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {POPULAR_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTopic(t);
                    setCustomTopic('');
                  }}
                  className={`px-3 py-2 rounded-xl text-left font-medium transition-all ${
                    topic === t && !customTopic
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Yoki boshqa mavzu yozing (masalan: Space exploration, Coffee culture)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-2"
            />
          </div>

          {/* Level Selector */}
          <div className="space-y-2">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ingliz tili darajasi (CEFR Level)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 rounded-xl font-bold text-center transition-all ${
                    level === lvl
                      ? 'bg-cyan-600 text-white ring-1 ring-cyan-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Length Selector */}
          <div className="space-y-2">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Matn uzunligi</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LENGTHS.map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`py-2 rounded-xl font-medium text-center transition-all ${
                    length === len
                      ? 'bg-amber-600 text-white ring-1 ring-amber-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px]">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matnni yaratish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
