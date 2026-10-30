import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Sparkles, X, Loader2, HelpCircle, Award, MessageSquare } from 'lucide-react';
import { PracticeQuestion, ReadingText } from '../../types';
import { aiService } from '../../services/ai/aiService';

interface PracticeModalProps {
  isOpen: boolean;
  text: ReadingText;
  assistanceLanguage: 'uz' | 'en';
  onClose: () => void;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  isOpen,
  text,
  assistanceLanguage,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'comprehension'>('quiz');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Comprehension free-text check
  const [studentSummary, setStudentSummary] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuestions();
    }
  }, [isOpen, text]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const q = await aiService.generatePracticeQuestions({
        text: text.content,
        title: text.title,
        level: text.level,
        count: 4,
      });
      setQuestions(q);
      setUserAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectAnswer = (qId: number, answer: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleEvaluateSummary = async () => {
    if (!studentSummary.trim()) return;
    setEvaluating(true);
    try {
      const res = await aiService.evaluateComprehension({
        studentSummary,
        originalText: text.content,
        lang: assistanceLanguage,
      });
      setEvaluation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  if (!isOpen) return null;

  const scoreCount = questions.filter((q) => userAnswers[q.id] === q.correctAnswer).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {assistanceLanguage === 'uz' ? 'Amaliyot va Matnni Tushunish' : 'Reading Practice & Comprehension'}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">"{text.title}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'quiz'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {assistanceLanguage === 'uz' ? 'Savollar (Quiz)' : 'Comprehension Quiz'}
          </button>
          <button
            onClick={() => setActiveTab('comprehension')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'comprehension'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {assistanceLanguage === 'uz' ? 'Oʻz soʻzingiz bilan aytib berish' : 'Explain in Your Words'}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'quiz' ? (
            loadingQuestions ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span>AI savollar tuzmoqda...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Savollar yaratilmadi.
                <button
                  onClick={loadQuestions}
                  className="block mx-auto mt-2 text-indigo-400 hover:underline"
                >
                  Qayta urinish
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {showResults && (
                  <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800 text-center space-y-1">
                    <span className="text-xl font-bold text-indigo-300">
                      {scoreCount} / {questions.length}
                    </span>
                    <p className="text-slate-300 text-xs font-medium">
                      {scoreCount === questions.length
                        ? 'Ajoyib natija! Matnni toʻliq tushundingiz.'
                        : 'Yaxshi urinish! Xatolarni koʻrib chiqing va davom eting.'}
                    </p>
                  </div>
                )}

                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                    <div className="font-semibold text-slate-100 text-sm">
                      {qIdx + 1}. {q.question}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === opt;
                        const isCorrect = q.correctAnswer === opt;

                        let btnStyle = 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/80';
                        if (showResults) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-medium';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-950/80 border-rose-600 text-rose-200 font-medium';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-indigo-600 text-white font-medium border-indigo-500 shadow-sm';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-2.5 rounded-lg text-left border transition-all text-xs flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {showResults && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && q.explanation && (
                      <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                        <span className="font-medium text-indigo-400">Izoh: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Tab 2: Explain in your own words */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                <span className="font-semibold text-indigo-300">
                  {assistanceLanguage === 'uz' ? 'Oʻqituvchi topshirigʻi:' : 'Teacher Prompt:'}
                </span>
                <p className="text-slate-300 text-xs">
                  "Tell me what you understood from this text. Write a short summary in English or Uzbek."
                </p>
              </div>

              <textarea
                value={studentSummary}
                onChange={(e) => setStudentSummary(e.target.value)}
                placeholder="Matndan nimalarni tushunganingizni qisqacha yozing..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={handleEvaluateSummary}
                disabled={evaluating || !studentSummary.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-colors shadow-sm"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Oʻqituvchi tekshirmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Javobimni baholash</span>
                  </>
                )}
              </button>

              {evaluation && (
                <div className="p-4 bg-slate-800/90 border border-indigo-500/40 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-semibold text-slate-200">AI Teacher Bahosi:</span>
                    <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-xs">
                      {evaluation.scoreOutOf100} / 100
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div>
                      <span className="font-medium text-indigo-300">Mazmunni tushunish: </span>
                      <span className="text-slate-300">{evaluation.understandingFeedback}</span>
                    </div>

                    <div>
                      <span className="font-medium text-emerald-300">Soʻz boyligi: </span>
                      <span className="text-slate-300">{evaluation.vocabularyFeedback}</span>
                    </div>

                    <div>
                      <span className="font-medium text-amber-300">Grammatika: </span>
                      <span className="text-slate-300">{evaluation.grammarFeedback}</span>
                    </div>

                    <div className="pt-2 text-indigo-200 italic font-medium">
                      "{evaluation.overallVerdict}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Yopish
          </button>

          {activeTab === 'quiz' && questions.length > 0 && (
            <div className="flex items-center gap-2">
              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold shadow-md transition-colors"
                >
                  Javoblarni tekshirish
                </button>
              ) : (
                <button
                  onClick={loadQuestions}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium border border-indigo-500/30 transition-colors"
                >
                  Yangi savollar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
