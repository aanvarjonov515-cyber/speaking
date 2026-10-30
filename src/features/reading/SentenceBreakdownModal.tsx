import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';
import { Layers, Sparkles, X, Check } from 'lucide-react';

interface SentenceBreakdownModalProps {
  isOpen: boolean;
  sentence: string;
  onClose: () => void;
}

interface SentenceStructure {
  subject: string;
  verb: string;
  object: string;
  grammarPatternUz: string;
  explanationUz: string;
}

export const SentenceBreakdownModal: React.FC<SentenceBreakdownModalProps> = ({
  isOpen,
  sentence,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SentenceStructure | null>(null);

  useEffect(() => {
    if (!isOpen || !sentence) return;
    setLoading(true);

    const parseSentence = async () => {
      try {
        const prompt = `Break down this English sentence into Subject, Verb, Object/Complement, and extract the Grammar Pattern in Uzbek: "${sentence}"`;
        const systemInstruction = `You are a syntax analysis engine. Return ONLY JSON with key structure:
{
  "subject": "subject part",
  "verb": "verb part",
  "object": "object/complement part",
  "grammarPatternUz": "e.g. Present Continuous (Hozirgi davomli)",
  "explanationUz": "Brief syntax explanation in Uzbek"
}`;
        const res = await aiService.generateContent(prompt, systemInstruction);
        const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
        setData(JSON.parse(clean));
      } catch {
        // Fallback simple parsing
        const words = sentence.split(' ');
        setData({
          subject: words[0] || 'Subject',
          verb: words[1] || 'Verb',
          object: words.slice(2).join(' ') || 'Object',
          grammarPatternUz: 'Asosiy Sintaksis Shakli (Subject + Verb + Object)',
          explanationUz: 'Gap egi (harakat bajaruvchi), fe\'l (bajarilayotgan harakat) va to\'ldiruvchiga ajratilgan.',
        });
      } finally {
        setLoading(false);
      }
    };

    parseSentence();
  }, [isOpen, sentence]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <span>Gap Grammatik Strukturasi (Sentence Breakdown)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tahlil qilinayotgan gap:</span>
          <p className="text-sm font-bold text-white font-mono mt-1">{sentence}</p>
        </div>

        {loading ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Sintaktik tahlil o'tkazilmoqda...</p>
          </div>
        ) : data ? (
          <div className="space-y-4 animate-fade-in">
            {/* Subject + Verb + Object Highlighted Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-950/30 border border-blue-500/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase">🟦 Ega (Subject)</span>
                <p className="text-xs font-bold text-blue-200 font-mono">{data.subject}</p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">🟩 Fe'l (Verb)</span>
                <p className="text-xs font-bold text-emerald-200 font-mono">{data.verb}</p>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">🟨 To'ldiruvchi (Object)</span>
                <p className="text-xs font-bold text-amber-200 font-mono">{data.object}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400">Grammatik Qoida:</span>
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {data.grammarPatternUz}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.explanationUz}</p>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
