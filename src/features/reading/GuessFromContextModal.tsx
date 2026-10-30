import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';
import { Sparkles, HelpCircle, CheckCircle2, X } from 'lucide-react';

interface GuessFromContextModalProps {
  isOpen: boolean;
  word: string;
  contextSentence: string;
  onClose: () => void;
}

export const GuessFromContextModal: React.FC<GuessFromContextModalProps> = ({
  isOpen,
  word,
  contextSentence,
  onClose,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEvaluateGuess = async () => {
    if (!guessInput.trim()) return;
    setEvaluating(true);
    setFeedback(null);

    try {
      const prompt = `Sentence: "${contextSentence}"\nTarget Word: "${word}"\nStudent Guess in Uzbek or English: "${guessInput}"`;
      const systemInstruction = `You are a Socratic AI Language Teacher. Evaluate the student's contextual guess for the word in Uzbek.
Acknowledge if their guess is close, state the exact Uzbek translation, and briefly explain how the surrounding context clues reveal the meaning.`;

      const response = await aiService.generateContent(prompt, systemInstruction);
      setFeedback(response);
    } catch {
      setFeedback(`Siz taxmin qilgan ma'no: "${guessInput}". So'zning aniq ma'nosi kontekstdan to'g'ri anglanishi mumkin.`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <HelpCircle className="w-5 h-5" />
            <span>Kontekstdan Taxmin Qilish (Guess from Context)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Kontekstli Gap:</span>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">{contextSentence}</p>
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Noma'lum so'z:</span>
            <span className="text-xs font-bold text-indigo-300 font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              {word}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Sizningcha ushbu so'z nima ma'noni bildirishi mumkin?
          </label>
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder="Taxminingizni o'zbekcha yoki inglizcha yozing..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
          >
            Yopish
          </button>
          <button
            disabled={evaluating || !guessInput.trim()}
            onClick={handleEvaluateGuess}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
          >
            {evaluating ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Taxminni Tekshirish</span>
              </>
            )}
          </button>
        </div>

        {feedback && (
          <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 space-y-1 animate-fade-in">
            <span className="font-bold text-indigo-300">🎓 O'qituvchi Boshqaruvi:</span>
            <p className="leading-relaxed">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
