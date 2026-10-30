import React, { useState } from 'react';
import { Volume2, Languages, Lightbulb, FileText, MessageSquare, Bookmark, X, Loader2, Check } from 'lucide-react';
import { ttsService } from '../../services/tts/ttsService';
import { aiService } from '../../services/ai/aiService';
import { DBService } from '../../services/database/dbService';

interface PhraseToolbarProps {
  x: number;
  y: number;
  selectedText: string;
  contextSentence: string;
  textId: string;
  onClose: () => void;
  onAskAI: (phrase: string) => void;
}

export const PhraseToolbar: React.FC<PhraseToolbarProps> = ({
  x,
  y,
  selectedText,
  contextSentence,
  textId,
  onClose,
  onAskAI,
}) => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const cleanPhrase = selectedText.trim();

  const handlePronounce = () => {
    ttsService.speak(cleanPhrase, { rate: 0.95 });
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await aiService.analyzeWord({
        word: cleanPhrase,
        sentence: contextSentence,
        lang: 'uz',
      });
      setResult(`Tarjima: ${res.translation}`);
    } catch {
      setResult('Tarjima qilinmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await aiService.analyzeWord({
        word: cleanPhrase,
        sentence: contextSentence,
        lang: 'uz',
      });
      setResult(res.simpleMeaning || 'Maʻnosi topilmadi');
    } catch {
      setResult('Maʻlumot olinmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhrase = () => {
    DBService.addPhrase({
      phrase: cleanPhrase,
      translation: result || 'Iboralar roʻyxatida',
      meaning: cleanPhrase,
      examples: [contextSentence],
      sourceTextId: textId,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1.5 text-xs text-slate-200 backdrop-blur-lg animate-in fade-in duration-100 max-w-sm"
      style={{
        left: `${Math.min(Math.max(16, x - 120), window.innerWidth - 320)}px`,
        top: `${Math.max(16, y - 56)}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1">
        <span className="font-semibold text-indigo-300 max-w-[120px] truncate px-2">
          "{cleanPhrase}"
        </span>

        <button
          onClick={handlePronounce}
          title="Read Phrase"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleTranslate}
          title="Translate"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          <Languages className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleExplain}
          title="Explain"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-300 hover:text-amber-200 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            onAskAI(cleanPhrase);
            onClose();
          }}
          title="Ask AI"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-blue-300 hover:text-blue-200 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleSavePhrase}
          title="Save Phrase"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Tahlil qilinmoqda...</span>
        </div>
      )}

      {result && (
        <div className="px-2 py-1 text-[11px] bg-slate-800/80 rounded border border-slate-700/60 text-slate-300 leading-snug">
          {result}
        </div>
      )}
    </div>
  );
};
