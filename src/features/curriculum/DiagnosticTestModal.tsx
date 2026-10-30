import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '../../services/curriculum/curriculumData';
import { CurriculumEngine } from '../../services/curriculum/curriculumEngine';
import { CurriculumLevelId } from '../../types/curriculum';
import { Sparkles, CheckCircle2, HelpCircle, Award, ArrowRight, RotateCcw, X } from 'lucide-react';

interface DiagnosticTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (placedLevelId: CurriculumLevelId) => void;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [placedLevel, setPlacedLevel] = useState<CurriculumLevelId>('LEVEL_0');

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    const updated = { ...userAnswers, [currentIndex]: optionIndex };
    setUserAnswers(updated);

    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate placement
      let correctCount = 0;
      let calculatedLevel: CurriculumLevelId = 'LEVEL_0';

      DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        if (updated[idx] === q.correctIndex) {
          correctCount++;
          calculatedLevel = q.levelId;
        }
      });

      // If score is 0 or 1 -> LEVEL_0
      if (correctCount === 0 || correctCount === 1) {
        calculatedLevel = 'LEVEL_0';
      }

      setPlacedLevel(calculatedLevel);
      setCompleted(true);
      CurriculumEngine.setPlacementResult(calculatedLevel);
    }
  };

  const handleStartFromZero = () => {
    CurriculumEngine.setPlacementResult('LEVEL_0');
    onComplete('LEVEL_0');
    onClose();
  };

  const handleFinishTest = () => {
    onComplete(placedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Darajani Aniqlash Testi (Placement Test)</h3>
              <p className="text-[11px] text-slate-400">0 dan IELTS 8 gacha mos darajani tanlash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col">
          {!completed ? (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Savol {currentIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}</span>
                <span className="text-indigo-400">
                  {Math.round(((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                  {currentQ.questionUz}
                </p>
                <p className="text-base font-bold text-white font-mono bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  {currentQ.promptEn}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-indigo-600/10 hover:border-indigo-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>

              {/* Skip Option */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-800/60">
                <button
                  onClick={handleStartFromZero}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Testni o'tkazib, 0-Darajadan boshlash</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Natijangiz Tayyor!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sizning bilimingiz tahlil qilindi. Tavsiya etilgan boshlang'ich darajangiz:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-base">
                  {placedLevel.replace('_', ' ')}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleStartFromZero}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Yo'q, 0 darajadan boshlayman
                </button>
                <button
                  onClick={handleFinishTest}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <span>Shu darajadan boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
