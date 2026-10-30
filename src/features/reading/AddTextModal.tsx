import React, { useState } from 'react';
import { X, Sparkles, Plus, Loader2, BookOpen, Upload, FileText } from 'lucide-react';
import { CEFRLevel, ReadingText } from '../../types';
import { aiService } from '../../services/ai/aiService';

interface AddTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (text: ReadingText) => void;
}

const LEVELS: CEFRLevel[] = ['Beginner', 'A1', 'A2', 'B1', 'B2', 'C1'];

export const AddTextModal: React.FC<AddTextModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Personal Study');
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [content, setContent] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Split raw content into clean sentence objects
  const splitIntoSentences = (raw: string) => {
    // Regex splits on sentence terminators while preserving words
    const matches = raw.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
    if (!matches) return [{ id: 0, text: raw.trim() }];
    return matches
      .map((s, idx) => ({ id: idx, text: s.trim() }))
      .filter((s) => s.text.length > 0);
  };

  const handleDetectLevel = async () => {
    if (!content.trim()) {
      setError('Avval matnni kiriting yoki paste qiling.');
      return;
    }
    setDetecting(true);
    setError(null);
    try {
      const res = await aiService.detectLevel(content, 'uz');
      setDetectedInfo(res);
      if (res?.estimatedLevel && LEVELS.includes(res.estimatedLevel as CEFRLevel)) {
        setLevel(res.estimatedLevel as CEFRLevel);
      }
    } catch (err: any) {
      setError('Darajani aniqlashda xatolik: ' + (err?.message || 'Qayta urinib koʻring'));
    } finally {
      setDetecting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Fayl hajmi 5MB dan oshmasligi kerak.');
      return;
    }

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Matn boʻsh boʻlishi mumkin emas.');
      return;
    }

    const sentences = splitIntoSentences(content);
    const newText: ReadingText = {
      id: 'text_' + Date.now(),
      title: title.trim() || 'Untitled Reading Text',
      topic: topic.trim() || 'General',
      level,
      content: content.trim(),
      sentences,
      sourceType: 'user',
      createdAt: Date.now(),
      lastReadAt: Date.now(),
      progressPercent: 0,
      currentSentenceIndex: 0,
    };

    onAdded(newText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Add My English Text</h2>
              <p className="text-xs text-slate-400">Oʻz matningizni qoʻshing va AI yordamida oʻrganing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* File Upload Row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div>
              <span className="font-medium text-slate-200">Fayldan yuklash (TXT / Subtitle)</span>
              <p className="text-[11px] text-slate-400">Maksimal hajm: 5MB</p>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer font-medium transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Faylni tanlash</span>
              <input
                type="file"
                accept=".txt,.vtt,.srt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Large Content Textarea */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">English Text</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write your English text here..."
              rows={9}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 text-slate-100 placeholder-slate-500 font-sans text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* AI Level Detector Bar */}
          <div className="flex items-center justify-between gap-3 p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/60">
            <div>
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Daraja Detektori</span>
              </div>
              <p className="text-[11px] text-slate-400">
                AI matnning murakkabligini tahlil qilib CEFR darajasini aniqlaydi
              </p>
            </div>
            <button
              type="button"
              onClick={handleDetectLevel}
              disabled={detecting || !content.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium shrink-0 transition-colors shadow-sm"
            >
              {detecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Aniqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Detect Level with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Detected Info Card */}
          {detectedInfo && (
            <div className="p-3.5 bg-slate-800/80 border border-indigo-500/40 rounded-xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-400">Tavsiya etilgan daraja:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-xs">
                  {detectedInfo.estimatedLevel}
                </span>
                <span className="text-slate-400 text-[11px]">· {detectedInfo.vocabularyComplexity}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {detectedInfo.explanation}
              </p>
            </div>
          )}

          {/* Meta Fields: Title, Topic, Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Matn sarlavhasi..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Mavzu (masalan: Business)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px]">
              {error}
            </div>
          )}

          {/* Submit Row */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Matnni qoʻshish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
