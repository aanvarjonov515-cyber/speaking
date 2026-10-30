import React, { useState } from 'react';
import {
  X,
  Languages,
  Sparkles,
  Volume2,
  Mic,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import { aiService } from '../../services/ai/aiService';
import { ttsService } from '../../services/tts/ttsService';

interface HowDoISayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic?: string;
  onUseInConversation?: (phrase: string) => void;
}

export const HowDoISayModal: React.FC<HowDoISayModalProps> = ({
  isOpen,
  onClose,
  currentTopic,
  onUseInConversation,
}) => {
  const [uzbekInput, setUzbekInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uzbekInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await aiService.howDoISay(uzbekInput.trim(), 'A2', currentTopic || 'Daily Conversation');
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = (text: string) => {
    ttsService.speak(text, { rate: 0.9 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">How Do I Say This?</h2>
              <p className="text-xs text-slate-400">Fikringizni inglizcha tabiiy ifodalashda yordam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <form onSubmit={handleTranslate} className="space-y-2">
            <label className="font-medium text-slate-300">
              Oʻzbek tilida yozing (nima demoqchisiz?):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={uzbekInput}
                onChange={(e) => setUzbekInput(e.target.value)}
                placeholder="Masalan: Men ertaga universitetga boraman demoqchiman..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !uzbekInput.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shrink-0 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Yordam</span>}
              </button>
            </div>
          </form>

          {/* Result Card */}
          {result && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3 animate-in fade-in">
              {/* Natural spoken version */}
              <div>
                <span className="text-slate-400 text-[11px] font-medium">Tabiiy jonli nutq shakli:</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="text-base font-bold text-emerald-300">
                    "{result.natural || result.english}"
                  </div>
                  <button
                    onClick={() => handlePronounce(result.natural || result.english)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-indigo-300 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Standard grammatical version */}
              {result.english !== result.natural && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400 text-[11px]">Standart variant: </span>
                  <span className="text-slate-200 font-medium">{result.english}</span>
                </div>
              )}

              {/* Uzbek Tip */}
              {result.tipUz && (
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-indigo-400">Ustoz maslahati: </span>
                  {result.tipUz}
                </div>
              )}

              {/* "Now you try!" CTA */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-amber-400 font-semibold text-xs animate-pulse">
                  👉 Endi oʻzingiz ovoz chiqarib aytib koʻring!
                </span>
                <button
                  onClick={() => {
                    onUseInConversation?.(result.natural || result.english);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                >
                  <span>Suhbatda qoʻllash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
