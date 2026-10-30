import React, { useState } from 'react';
import {
  X,
  Award,
  Zap,
  TrendingUp,
  Volume2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SpeakingSession } from '../../types';
import { ttsService } from '../../services/tts/ttsService';

interface SpeakingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: SpeakingSession | null;
  onPracticeCorrection?: (correctedSentence: string) => void;
}

export const SpeakingReportModal: React.FC<SpeakingReportModalProps> = ({
  isOpen,
  onClose,
  sessionData,
  onPracticeCorrection,
}) => {
  const [expandedSection, setExpandedSection] = useState<'grammar' | 'pronunciation' | 'fluency'>('grammar');
  const [practicingSentence, setPracticingSentence] = useState<string | null>(null);

  if (!isOpen || !sessionData) return null;

  const totalTime = Math.max(1, sessionData.durationSeconds);
  const userPercent = Math.min(100, Math.round((sessionData.userTalkingSeconds / totalTime) * 100));
  const teacherPercent = 100 - userPercent;

  const handlePronounce = (text: string) => {
    ttsService.speak(text, { rate: 0.9 });
  };

  const handlePractice = (corrected: string) => {
    setPracticingSentence(corrected);
    ttsService.speak(corrected, { rate: 0.85 });
    onPracticeCorrection?.(corrected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Speaking Session Report</h2>
              <p className="text-xs text-slate-400">
                Mavzu: "{sessionData.topic}" · {Math.round(sessionData.durationSeconds / 60)} daqiqa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* 1. Primary Highlight Card: Single Key Takeaway */}
          {sessionData.keyTakeaway && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-slate-900 border border-indigo-800/80 shadow-md space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Asosiy Yaxshilanish Maslahati (Key Takeaway)</span>
              </span>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                "{sessionData.keyTakeaway}"
              </p>
            </div>
          )}

          {/* 2. Primary KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center space-y-1">
              <span className="text-slate-400 text-[11px]">Fluency</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {sessionData.fluencyScore !== null && sessionData.fluencyScore !== undefined ? `${sessionData.fluencyScore}%` : 'Not assessed'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center space-y-1">
              <span className="text-slate-400 text-[11px]">Grammar</span>
              <div className="text-xl font-bold font-mono text-indigo-400">
                {sessionData.grammarScore !== null && sessionData.grammarScore !== undefined ? `${sessionData.grammarScore}%` : 'Not assessed'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center space-y-1">
              <span className="text-slate-400 text-[11px]">Vocabulary</span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {sessionData.vocabularyScore !== null && sessionData.vocabularyScore !== undefined ? `${sessionData.vocabularyScore}%` : 'Not assessed'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center space-y-1">
              <span className="text-slate-400 text-[11px]">Umumiy ball</span>
              <div className="text-xl font-bold font-mono text-amber-400">
                {sessionData.overallScore !== null && sessionData.overallScore !== undefined ? `${sessionData.overallScore}%` : 'Not assessed'}
              </div>
            </div>
          </div>

          {/* 3. Speaking Time Ratio (User vs Teacher) */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <div className="flex justify-between font-medium">
              <span className="text-emerald-400">Siz gapirgan vaqt: {userPercent}%</span>
              <span className="text-indigo-400">Oʻqituvchi vaqti: {teacherPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-indigo-900 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${userPercent}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              {userPercent >= 60
                ? 'Ajoyib! Siz suhbatning asosiy qismida faol gapirdingiz.'
                : 'Yaxshi! Keyingi safar yana ham uzunroq javob berishga harakat qiling.'}
            </p>
          </div>

          {/* 4. Filler Words Tracker */}
          {sessionData.fillerWordsCount && Object.keys(sessionData.fillerWordsCount).length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Ortiqcha toʻxtalish soʻzlari (Fillers):</span>
              <div className="flex gap-2">
                {Object.entries(sessionData.fillerWordsCount).map(([word, count]) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    "{word}": {count} marta
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Grammar Corrections & "Practice This" */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200">
                Grammatik Tuzatishlar va Qayta Mashq ({sessionData.turns.filter((t) => t.correction?.hasCorrection).length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {sessionData.turns
                .filter((t) => t.correction?.hasCorrection)
                .map((turn, idx) => {
                  const corr = turn.correction!;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-rose-300 line-through">
                          <span className="w-4 h-4 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            ✕
                          </span>
                          <span>"{corr.userOriginal}"</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                          <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            ✓
                          </span>
                          <span>"{corr.corrected}"</span>
                        </div>
                      </div>

                      {corr.explanationUz && (
                        <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          {corr.explanationUz}
                        </p>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          onClick={() => handlePronounce(corr.corrected!)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-indigo-300 text-[11px]"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Ovozini eshitish</span>
                        </button>

                        <button
                          onClick={() => handlePractice(corr.corrected!)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] shadow-sm"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Practice this</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors"
          >
            Sessiyani yakunlash
          </button>
        </div>
      </div>
    </div>
  );
};
