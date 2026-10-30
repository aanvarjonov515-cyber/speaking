import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Layers,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
} from 'lucide-react';

export type WritingStage = 'word' | 'sentence' | 'paragraph' | 'essay';

export interface CriteriaScore {
  score: number;
  feedbackUz: string;
}

export interface WritingAnalysisResult {
  status: 'assessed' | 'unavailable';
  wordCount: number;
  overallScore: number;
  criteria?: {
    taskResponse?: CriteriaScore;
    coherenceCohesion?: CriteriaScore;
    lexicalResource?: CriteriaScore;
    grammaticalAccuracy?: CriteriaScore;
  };
  bandScoreEstimate?: string;
  cefrProgress?: 'emerging' | 'developing' | 'secure' | 'mastered';
  errors: Array<{
    type: 'grammar' | 'vocab' | 'word_order' | 'spelling';
    text: string;
    suggestion: string;
    explanationUz: string;
  }>;
  strengthsUz?: string[];
  priorityImprovementUz?: string;
  feedbackUz: string;
  improvedVersionEn: string;
  nextExercise?: {
    promptEn: string;
    targetRuleUz: string;
  };
}

interface WritingWorkspaceProps {
  userLevel?: string;
  onOpenSettings?: () => void;
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({
  userLevel = 'A2',
  onOpenSettings,
}) => {
  const [stage, setStage] = useState<WritingStage>('sentence');
  const [prompt, setPrompt] = useState<string>(
    'In many countries, people are moving from rural areas to big cities. What are the advantages and disadvantages of this trend?'
  );
  const [userText, setUserText] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<WritingAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Progressive Correction & Improved Version Visibility
  const [showImprovedVersion, setShowImprovedVersion] = useState<boolean>(false);

  // 3-Tier Hint Assistant State
  const [hintTier, setHintTier] = useState<0 | 1 | 2 | 3>(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);

  // 1. Analyze user text with AI (No Fake Fallback Scores!)
  const handleAnalyzeText = async () => {
    if (!userText.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setErrorMessage(null);
    setShowImprovedVersion(false);

    try {
      const data = await aiService.analyzeWriting({
        text: userText,
        task: prompt,
        stage,
        level: userLevel,
      });

      if (!data || data.status === 'unavailable') {
        setErrorMessage('Tahlil xizmati vaqtincha mavjud emas. Ulanishni tekshiring.');
      } else {
        setResult(data as WritingAnalysisResult);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'AI tahlil serveriga ulanishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // 2. Request 3-Tier AI Hints
  const handleGetHint = async (nextTier: 1 | 2 | 3) => {
    setLoadingHint(true);
    setHintTier(nextTier);

    try {
      let promptInstructions = '';
      if (nextTier === 1) {
        promptInstructions = 'Give Tier 1 Hint: Point out the problem area or main idea to focus on WITHOUT giving away any corrected words or answers. Keep it in Uzbek.';
      } else if (nextTier === 2) {
        promptInstructions = 'Give Tier 2 Hint: Remind the student of the grammar rule, collocation, or structural template needed here in Uzbek.';
      } else {
        promptInstructions = 'Give Tier 3 Hint: Reveal the exact model sentence or correct solution with detailed explanation in Uzbek.';
      }

      const aiPrompt = `Topic: "${prompt}"\nCurrent student attempt: "${userText}"\nInstruction: ${promptInstructions}`;
      const hintRes = await aiService.generateContent(aiPrompt, 'You are an encouraging Socratic English AI Teacher. Respond in Uzbek.');
      setCurrentHint(hintRes);
    } catch {
      setCurrentHint('📌 O\'qituvchi maslahati: Ulanishni tekshirib, qayta urinib ko\'ring.');
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 space-y-6">
      {/* Top Header & Stage Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Yozish Studiyasi (Writing Studio)</h2>
            <p className="text-xs text-slate-400">So'z → Gap → Abzas → IELTS Task 1/2 Insholar</p>
          </div>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'word', label: "1. So'z" },
            { id: 'sentence', label: '2. Gap' },
            { id: 'paragraph', label: '3. Abzas' },
            { id: 'essay', label: '4. IELTS Insho' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStage(st.id as WritingStage);
                setResult(null);
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stage === st.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Prompts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prompt Banner */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Mavzu / Topshiriq (Prompt)
            </span>
            <p className="text-xs font-bold text-slate-200 font-sans">{prompt}</p>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Javobingizni yoki insho matnini shu yerga ingliz tilida yozing..."
              className="w-full h-64 bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 resize-none font-sans leading-relaxed outline-none transition-all shadow-inner"
            />
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              {userText.trim() ? userText.trim().split(/\s+/).length : 0} so'z
            </div>
          </div>

          {/* Action Bar & 3-Tier Hint Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 3-Tier AI Hints */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Yordam:
              </span>
              <button
                disabled={loadingHint || !userText.trim()}
                onClick={() => handleGetHint(1)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  hintTier === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1-Daraja (Joy)
              </button>
              <button
                disabled={loadingHint || !userText.trim()}
                onClick={() => handleGetHint(2)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  hintTier === 2 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2-Daraja (Qoida)
              </button>
              <button
                disabled={loadingHint || !userText.trim()}
                onClick={() => handleGetHint(3)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  hintTier === 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3-Daraja (Yechim)
              </button>
            </div>

            {/* Analyze Button */}
            <button
              disabled={analyzing || !userText.trim()}
              onClick={handleAnalyzeText}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Tahlil qilinmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Bilan Tahlil Qilish</span>
                </>
              )}
            </button>
          </div>

          {/* Render Hint Box */}
          {currentHint && (
            <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-1 animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                O'qituvchi Maslahati ({hintTier}-Bosqich Yordam)
              </span>
              <p className="text-xs text-amber-100 leading-relaxed font-sans">{currentHint}</p>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis & Real Error Report (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {errorMessage ? (
            <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 space-y-4 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Tahlil Amalga Oshmadi</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">{errorMessage}</p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleAnalyzeText}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Qayta Urinish</span>
                </button>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Sozlamalarni Ochish</span>
                  </button>
                )}
              </div>
            </div>
          ) : result ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl animate-fade-in">
              {/* Scores & Band/CEFR Overview */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Umumiy Natija {result.bandScoreEstimate ? `(${result.bandScoreEstimate})` : result.cefrProgress ? `(Daraja: ${result.cefrProgress.toUpperCase()})` : ''}
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-400">{result.overallScore} / 100</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                    So'zlar soni: {result.wordCount}
                  </span>
                  {result.bandScoreEstimate && (
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {result.bandScoreEstimate}
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Core IELTS/CEFR Criteria Breakdown */}
              {result.criteria && (
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Mezonlar Bo'yicha Tahlil (4 Core Criteria)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {result.criteria.taskResponse && (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Task Response</span>
                        <span className="text-emerald-400 font-bold font-mono">{result.criteria.taskResponse.score} / 100</span>
                      </div>
                    )}
                    {result.criteria.coherenceCohesion && (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Coherence & Cohesion</span>
                        <span className="text-emerald-400 font-bold font-mono">{result.criteria.coherenceCohesion.score} / 100</span>
                      </div>
                    )}
                    {result.criteria.lexicalResource && (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Lexical Resource</span>
                        <span className="text-emerald-400 font-bold font-mono">{result.criteria.lexicalResource.score} / 100</span>
                      </div>
                    )}
                    {result.criteria.grammaticalAccuracy && (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Grammar Accuracy</span>
                        <span className="text-emerald-400 font-bold font-mono">{result.criteria.grammaticalAccuracy.score} / 100</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Color-Coded Error List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Rangli Xatolar Tahlili (Color-Coded Analysis)</span>
                </h3>

                {result.errors.length === 0 ? (
                  <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ajoyib! Jiddiy grammatik yoki lug'at xatolari topilmadi.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {result.errors.map((err, i) => {
                      const badgeStyles =
                        err.type === 'grammar'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : err.type === 'vocab'
                          ? 'bg-orange-950/80 text-orange-300 border-orange-800'
                          : err.type === 'word_order'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-blue-950/80 text-blue-300 border-blue-800';

                      return (
                        <div key={i} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${badgeStyles}`}>
                              {err.type === 'grammar' ? '🔴 Grammatika' : err.type === 'vocab' ? '🟠 Lug\'at' : err.type === 'word_order' ? '🟡 So\'z Tartibi' : '🔵 Imlo'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">Xatolik #{i + 1}</span>
                          </div>

                          <div className="text-xs font-mono">
                            <span className="line-through text-rose-400 mr-2">{err.text}</span>
                            <span className="text-emerald-400 font-bold">{err.suggestion}</span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">{err.explanationUz}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* General Feedback & Optional Improved Version Toggle */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    O'qituvchi Xulosasi (Uzbek)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.feedbackUz}</p>
                </div>

                {/* Show/Hide Improved Model Version */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowImprovedVersion(!showImprovedVersion)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-between"
                  >
                    <span>Mukammallashtirilgan Namuna Versiyani Ko'rish</span>
                    {showImprovedVersion ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showImprovedVersion && (
                    <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 space-y-1 animate-fade-in">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Model Versiya (Band 8+ / Native)
                      </span>
                      <p className="text-xs text-emerald-200 font-mono leading-relaxed">{result.improvedVersionEn}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Tekshiruv Kutilmoqda</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Chap tomondagi maydonga matn yozing va "AI Bilan Tahlil Qilish" tugmasini bosing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
