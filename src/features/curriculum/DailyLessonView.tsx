import React, { useState, useEffect } from 'react';
import { LessonUnit, SevenElementVocab, ReviewQuestion, CoreTask, HomeworkItem } from '../../types/curriculum';
import { CurriculumEngine } from '../../services/curriculum/curriculumEngine';
import { ttsService } from '../../services/tts/ttsService';
import { speechRecognitionService } from '../../services/speech/speechRecognitionService';
import { DBService } from '../../services/database/dbService';
import {
  Sparkles,
  Volume2,
  BookmarkPlus,
  Mic,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Lightbulb,
  AlertTriangle,
  Key,
  Bookmark,
  HelpCircle,
  Check,
  Zap,
} from 'lucide-react';

interface DailyLessonViewProps {
  lesson: LessonUnit;
  onBackToRoadmap: () => void;
  onLessonComplete: (passed: boolean) => void;
}

type LessonStep = 'review' | 'goal_vocab' | 'grammar' | 'core_tasks' | 'homework' | 'results';

export const DailyLessonView: React.FC<DailyLessonViewProps> = ({
  lesson,
  onBackToRoadmap,
  onLessonComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<LessonStep>('review');

  // Review step state
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState<Record<number, number>>({});
  const [reviewSocratic, setReviewSocratic] = useState<{
    show: boolean;
    isCorrect: boolean;
    explanation: string;
    rule: string;
    model: string;
  } | null>(null);

  // Vocab step state
  const [activeVocabIdx, setActiveVocabIdx] = useState(0);
  const [savedVocabIds, setSavedVocabIds] = useState<Set<string>>(new Set());
  const [recordingVocabId, setRecordingVocabId] = useState<string | null>(null);
  const [speakingFeedback, setSpeakingFeedback] = useState<string | null>(null);

  // Core Tasks step state
  const [taskIdx, setTaskIdx] = useState(0);
  const [taskAnswers, setTaskAnswers] = useState<Record<number, string>>({});
  const [taskSocratic, setTaskSocratic] = useState<{
    show: boolean;
    isCorrect: boolean;
    explanation: string;
    rule: string;
    model: string;
  } | null>(null);

  // Homework step state
  const [hwIdx, setHwIdx] = useState(0);
  const [hwAnswers, setHwAnswers] = useState<Record<number, string>>({});
  const [hwSocratic, setHwSocratic] = useState<{
    show: boolean;
    isCorrect: boolean;
    explanation: string;
    rule: string;
    model: string;
  } | null>(null);

  // Total Scores
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [resultMessage, setResultMessage] = useState('');

  // 1. Speak word TTS
  const handlePlayAudio = (text: string) => {
    ttsService.speak(text, { rate: 0.9 });
  };

  // 2. Save word to DB
  const handleSaveWord = (vocab: SevenElementVocab) => {
    DBService.addWord({
      word: vocab.word,
      phonetic: vocab.phonetic,
      translationUz: vocab.translationUz,
      translationEn: vocab.simpleExampleEn,
      partOfSpeech: vocab.partOfSpeech,
      simpleMeaning: vocab.commonCollocation,
      forms: vocab.forms,
      examples: [vocab.simpleExampleEn, vocab.simpleExampleUz],
      status: 'New',
    });
    setSavedVocabIds((prev) => new Set(prev).add(vocab.id));
  };

  // 3. Pronunciation test for Vocab
  const handleTestSpeech = (expectedWord: string) => {
    setRecordingVocabId(expectedWord);
    setSpeakingFeedback('Eshitilmoqda... Talaffuz qiling!');

    const cleanup = speechRecognitionService.onResult((transcript, isFinal) => {
      if (isFinal) {
        cleanup();
        speechRecognitionService.stopListening();
        setRecordingVocabId(null);
        const cleanTrans = transcript.toLowerCase().trim();
        const cleanExp = expectedWord.toLowerCase().trim();
        if (cleanTrans.includes(cleanExp) || cleanExp.includes(cleanTrans)) {
          setSpeakingFeedback('Ajoyib talaffuz! A+ ✅');
        } else {
          setSpeakingFeedback(`⚠️ Eshitildi: "${transcript}". Qayta urinib ko'ring!`);
        }
      }
    });

    speechRecognitionService.startListening();
  };

  // Handle Review Answer
  const handleAnswerReview = (optionIdx: number) => {
    const q = lesson.reviewQuestions[reviewIdx];
    const isCorrect = optionIdx === q.correctOptionIndex;

    setReviewAnswers((prev) => ({ ...prev, [reviewIdx]: optionIdx }));

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setReviewSocratic({
      show: true,
      isCorrect,
      explanation: isCorrect ? 'Barakalla! To\'g\'ri javob.' : q.socraticExplanationUz,
      rule: q.ruleUz,
      model: q.correctModelEn,
    });
  };

  const handleNextReview = () => {
    setReviewSocratic(null);
    if (reviewIdx < lesson.reviewQuestions.length - 1) {
      setReviewIdx(reviewIdx + 1);
    } else {
      setCurrentStep('goal_vocab');
    }
  };

  // Handle Core Task Answer
  const handleAnswerTask = (answerStr: string) => {
    const task = lesson.coreTasks[taskIdx];
    const isCorrect = answerStr.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();

    setTaskAnswers((prev) => ({ ...prev, [taskIdx]: answerStr }));

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setTaskSocratic({
      show: true,
      isCorrect,
      explanation: isCorrect ? 'Ajoyib! To\'g\'ri bajardingiz.' : task.socraticFeedback.explanationUz,
      rule: task.socraticFeedback.ruleUz,
      model: task.socraticFeedback.modelExampleEn,
    });
  };

  const handleNextTask = () => {
    setTaskSocratic(null);
    if (taskIdx < lesson.coreTasks.length - 1) {
      setTaskIdx(taskIdx + 1);
    } else {
      setCurrentStep('homework');
    }
  };

  // Handle Homework Answer
  const handleAnswerHw = (ans: string) => {
    const hw = lesson.homeworkItems[hwIdx];
    const isCorrect = ans.trim().toLowerCase() === hw.correctAnswer.trim().toLowerCase();

    setHwAnswers((prev) => ({ ...prev, [hwIdx]: ans }));

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setHwSocratic({
      show: true,
      isCorrect,
      explanation: isCorrect ? 'Mukammal! Ishingiz to\'g\'ri.' : hw.socraticFeedbackUz.explanation,
      rule: hw.socraticFeedbackUz.rule,
      model: hw.socraticFeedbackUz.correctModel,
    });
  };

  const handleNextHw = () => {
    setHwSocratic(null);
    if (hwIdx < lesson.homeworkItems.length - 1) {
      setHwIdx(hwIdx + 1);
    } else {
      // Finish lesson & calculate score
      const totalQ = lesson.reviewQuestions.length + lesson.coreTasks.length + lesson.homeworkItems.length;
      setTotalQuestionsCount(totalQ);

      const percent = Math.round((correctCount / totalQ) * 100);
      const res = CurriculumEngine.submitLessonScore(lesson.id, percent);

      setResultMessage(res.messageUz);
      setCurrentStep('results');
      onLessonComplete(res.passed);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToRoadmap}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xaritaga qaytish</span>
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
              Unit {lesson.unitNumber} — Lesson {lesson.lessonNumber}
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-md mt-0.5">{lesson.titleUz}</h2>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {[
            { id: 'review', label: '1. Review' },
            { id: 'goal_vocab', label: '2. Vocab' },
            { id: 'grammar', label: '3. Grammar' },
            { id: 'core_tasks', label: '4. Tasks (3)' },
            { id: 'homework', label: '5. Homework (10)' },
          ].map((st) => (
            <span
              key={st.id}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentStep === st.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </span>
          ))}
        </div>
      </div>

      {/* STEP 1: 2-MINUTE REVIEW */}
      {currentStep === 'review' && (
        <div className="max-w-3xl mx-auto w-full p-6 space-y-6 my-auto animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1. Oldingi Darsdan 2 Daqiqalik Review</h3>
                <p className="text-xs text-slate-400">
                  Bilimlaringizni sinash uchun 3–5 ta micro savol ga javob bering.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
              {reviewIdx + 1} / {lesson.reviewQuestions.length}
            </span>
          </div>

          {/* Question Box */}
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-300">{lesson.reviewQuestions[reviewIdx].questionUz}</h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-base font-bold text-indigo-300">
              {lesson.reviewQuestions[reviewIdx].promptEn}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {lesson.reviewQuestions[reviewIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={reviewSocratic !== null}
                  onClick={() => handleAnswerReview(idx)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    reviewAnswers[reviewIdx] === idx
                      ? reviewSocratic?.isCorrect
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                        : 'bg-rose-600/20 border-rose-500 text-rose-200'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Socratic Feedback Box */}
          {reviewSocratic && (
            <div
              className={`p-5 rounded-2xl border ${
                reviewSocratic.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              } space-y-3 animate-fade-in`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {reviewSocratic.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span>{reviewSocratic.explanation}</span>
              </div>
              <div className="text-xs space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-sans">
                <p className="font-semibold text-slate-300">🗝️ Qoida: {reviewSocratic.rule}</p>
                <p className="text-slate-400">✨ To'g'ri model: <span className="font-mono text-indigo-300">{reviewSocratic.model}</span></p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextReview}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>Keyingi review savoli</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: TODAY'S GOAL & 7-ELEMENT VOCABULARY */}
      {currentStep === 'goal_vocab' && (
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6 animate-fade-in">
          {/* Today's Goal Banner */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              Bugungi Dars Maqsadi
            </span>
            <h3 className="text-lg font-bold text-white">{lesson.targetGoalUz}</h3>
          </div>

          {/* 7-Element Vocab Carousel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Yangi So'zlar (Har bir so'z uchun 7 ta element)</span>
              </h3>
              <div className="flex gap-1.5">
                {lesson.vocabulary.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVocabIdx(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      activeVocabIdx === i
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Vocab 7-Element Card */}
            {lesson.vocabulary[activeVocabIdx] && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Main Word Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-white">{lesson.vocabulary[activeVocabIdx].word}</h2>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        {lesson.vocabulary[activeVocabIdx].phonetic}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800">
                        {lesson.vocabulary[activeVocabIdx].partOfSpeech}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-300 mt-1">{lesson.vocabulary[activeVocabIdx].translationUz}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(lesson.vocabulary[activeVocabIdx].word)}
                      className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-all"
                      title="Eshitish (Listen)"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleTestSpeech(lesson.vocabulary[activeVocabIdx].word)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        recordingVocabId === lesson.vocabulary[activeVocabIdx].word
                          ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                          : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-500/30'
                      }`}
                      title="Takrorlash (Repeat)"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSaveWord(lesson.vocabulary[activeVocabIdx])}
                      className={`p-2.5 rounded-xl border transition-all ${
                        savedVocabIds.has(lesson.vocabulary[activeVocabIdx].id)
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Lug'atga saqlash (Save)"
                    >
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Pronunciation Feedback */}
                {speakingFeedback && (
                  <div className="bg-purple-950/50 p-3 rounded-xl border border-purple-800 text-xs text-purple-200">
                    {speakingFeedback}
                  </div>
                )}

                {/* 7 Elements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">1. Oddiy Misol (English)</span>
                    <p className="text-xs font-semibold text-indigo-300 font-mono">
                      {lesson.vocabulary[activeVocabIdx].simpleExampleEn}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">2. Tarjimasi (Uzbek)</span>
                    <p className="text-xs font-semibold text-slate-200">
                      {lesson.vocabulary[activeVocabIdx].simpleExampleUz}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">3. Birikmasi (Collocation)</span>
                    <p className="text-xs font-semibold text-emerald-300 font-mono">
                      {lesson.vocabulary[activeVocabIdx].commonCollocation}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">4. Shakllari (Forms)</span>
                    <p className="text-xs font-semibold text-amber-300 font-mono">
                      {lesson.vocabulary[activeVocabIdx].forms}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep('grammar')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <span>3. Grammatika darsiga o'tish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: KEY WORD GRAMMAR SYSTEM & 5 TEACHER NOTES */}
      {currentStep === 'grammar' && (
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800">
                Grammatika Moduli
              </span>
              <h3 className="text-xl font-extrabold text-white">{lesson.grammar.title}</h3>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                Struktura: {lesson.grammar.structurePattern}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{lesson.grammar.explanationUz}</p>
            </div>

            {/* 5 Mandatory Teacher Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🎓 O'qituvchi Qaydnomalari (5 ta Muhim Element)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Teacher Tip */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Lightbulb className="w-4 h-4" />
                    <span>O'qituvchi Maslahati</span>
                  </div>
                  <p className="text-xs text-amber-100/90">{lesson.grammar.teacherNotes.teacherTipUz}</p>
                </div>

                {/* 2. Common Mistake */}
                <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ko'p Qilinadigan Xato</span>
                  </div>
                  <p className="text-xs text-rose-100/90">{lesson.grammar.teacherNotes.commonMistakeUz}</p>
                </div>

                {/* 3. Key Rule */}
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                    <Key className="w-4 h-4" />
                    <span>Asosiy Kalit Qoida</span>
                  </div>
                  <p className="text-xs text-indigo-100/90">{lesson.grammar.teacherNotes.keyRuleUz}</p>
                </div>

                {/* 4. Remember */}
                <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                    <Bookmark className="w-4 h-4" />
                    <span>Yodda Tuting</span>
                  </div>
                  <p className="text-xs text-teal-100/90">{lesson.grammar.teacherNotes.rememberUz}</p>
                </div>
              </div>

              {/* 5. Why */}
              <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                  <HelpCircle className="w-4 h-4" />
                  <span>Nima Uchun Shunday?</span>
                </div>
                <p className="text-xs text-purple-100/90">{lesson.grammar.teacherNotes.whyUz}</p>
              </div>
            </div>

            {/* Key Word Examples */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400">Kalit So'zlar Bilan Misollar:</h4>
              <div className="space-y-2">
                {lesson.grammar.keyWordExamples.map((ex, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-sans">
                    <div>
                      <span className="font-mono text-indigo-300 font-bold">{ex.en}</span>
                      <p className="text-slate-400 text-[11px]">{ex.uz}</p>
                    </div>
                    <button
                      onClick={() => handlePlayAudio(ex.en)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('core_tasks')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <span>4. Amaliy Topshiriqlarga O'tish (3 Core Tasks)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: 3 CORE TASKS (Understand -> Use -> Produce) */}
      {currentStep === 'core_tasks' && (
        <div className="max-w-3xl mx-auto w-full p-6 space-y-6 my-auto animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded border border-indigo-800">
                {lesson.coreTasks[taskIdx]?.titleUz}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Topshiriq {taskIdx + 1} / {lesson.coreTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium">{lesson.coreTasks[taskIdx]?.instructionsUz}</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm font-bold text-indigo-300">
                {lesson.coreTasks[taskIdx]?.promptEn}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {lesson.coreTasks[taskIdx]?.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={taskSocratic !== null}
                    onClick={() => handleAnswerTask(opt)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-indigo-600/10 hover:border-indigo-500/40 text-left text-xs font-medium text-slate-200 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Socratic Feedback */}
            {taskSocratic && (
              <div
                className={`p-5 rounded-2xl border ${
                  taskSocratic.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                } space-y-3 animate-fade-in`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {taskSocratic.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span>{taskSocratic.explanation}</span>
                </div>
                <div className="text-xs space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-sans">
                  <p className="font-semibold text-slate-300">🗝️ Qoida: {taskSocratic.rule}</p>
                  <p className="text-slate-400">
                    ✨ Model misol: <span className="font-mono text-indigo-300">{taskSocratic.model}</span>
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextTask}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>Keyingi topshiriq</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: 10 HOMEWORK ITEMS */}
      {currentStep === 'homework' && (
        <div className="max-w-3xl mx-auto w-full p-6 space-y-6 my-auto animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                10 Uy Vazifasi — {lesson.homeworkItems[hwIdx]?.titleUz}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {hwIdx + 1} / 10
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm font-bold text-indigo-300">
                {lesson.homeworkItems[hwIdx]?.promptEn}
              </div>

              {lesson.homeworkItems[hwIdx]?.audioPromptText && (
                <button
                  onClick={() => handlePlayAudio(lesson.homeworkItems[hwIdx].audioPromptText!)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Audio tinglash</span>
                </button>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {lesson.homeworkItems[hwIdx]?.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={hwSocratic !== null}
                    onClick={() => handleAnswerHw(opt)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-indigo-600/10 hover:border-indigo-500/40 text-left text-xs font-medium text-slate-200 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Socratic Feedback */}
            {hwSocratic && (
              <div
                className={`p-5 rounded-2xl border ${
                  hwSocratic.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                } space-y-3 animate-fade-in`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {hwSocratic.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span>{hwSocratic.explanation}</span>
                </div>
                <div className="text-xs space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-sans">
                  <p className="font-semibold text-slate-300">🗝️ Qoida: {hwSocratic.rule}</p>
                  <p className="text-slate-400">
                    ✨ Model: <span className="font-mono text-indigo-300">{hwSocratic.model}</span>
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextHw}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>{hwIdx < 9 ? 'Keyingi uy vazifasi' : 'Natijalarni ko\'rish'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: RESULTS & MASTERY GATE MODAL */}
      {currentStep === 'results' && (
        <div className="max-w-xl mx-auto w-full p-6 my-auto text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-xl">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">Dars Yakunlandi!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">{resultMessage}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onBackToRoadmap}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              O'quv xaritasiga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
