import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Mic,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  Play,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CEFRLevel, SpeakingLesson } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { speechRecognitionService } from '../../services/speech/speechRecognitionService';
import { aiService } from '../../services/ai/aiService';

interface LessonsTabProps {
  currentLevel: CEFRLevel;
  onStartLessonConversation: (lesson: SpeakingLesson) => void;
}

const DEFAULT_LESSONS: SpeakingLesson[] = [
  {
    id: 'lesson-1',
    title: 'Expressing Opinions Politely',
    topic: 'Professional Communication',
    level: 'B1',
    targetGrammar: 'Modal verbs & introductory hedges (In my opinion, I would say...)',
    targetPhrases: [
      {
        phrase: 'From my perspective, this approach is more effective.',
        translationUz: 'Mening nuqtai nazarimdan, bu yondashuv samaraliroq.',
        phonetic: '/frəm maɪ pəˈspektɪv ðɪs əˈprəʊtʃ ɪz mɔːr ɪˈfektɪv/',
        usageNote: 'Used in business or academic settings to share an opinion diplomatically.',
      },
      {
        phrase: 'I see your point, but have we considered the alternatives?',
        translationUz: 'Fikringizni tushundim, lekin muqobil variantlarni koʻrib chiqdikmi?',
        phonetic: '/aɪ siː jɔː pɔɪnt bʌt hæv wiː kənˈsɪdəd ðiː ɔːlˈtɜːnətɪvz/',
        usageNote: 'A gentle way to disagree without sounding confrontational.',
      },
      {
        phrase: 'I am inclined to believe that quality matters most.',
        translationUz: 'Men sifat eng muhim narsa ekanligiga ishonishga moyilman.',
        phonetic: '/aɪ æm ɪnˈklaɪnd tuː bɪˈliːv ðæt ˈkwɒlɪti ˈmætəz məʊst/',
        usageNote: 'Formal expression showing thoughtful consideration.',
      },
      {
        phrase: 'If you ask me, we should test it first.',
        translationUz: 'Mendan soʻrasangiz, avval buni sinab koʻrishimiz kerak.',
        phonetic: '/ɪf juː ɑːsk miː wiː ʃʊd test ɪt fɜːst/',
        usageNote: 'Natural conversational hedge for everyday discussions.',
      },
    ],
    practiceTasks: [
      {
        prompt: 'Disagree politely with a colleague who suggests working this weekend.',
        expectedStructure: 'Use "I see your point, but..."',
        sampleAnswer: 'I see your point about deadlines, but could we finish this on Monday morning instead?',
      },
      {
        prompt: 'State your opinion on remote work vs office work.',
        expectedStructure: 'Use "From my perspective..." or "I am inclined to believe..."',
        sampleAnswer: 'From my perspective, a hybrid model gives team members the best balance.',
      },
    ],
    applyStarter: "Let's discuss remote work policies. What is your honest opinion about flexible schedules?",
  },
  {
    id: 'lesson-2',
    title: 'Ordering at a Restaurant & Dietary Requests',
    topic: 'Daily Life & Dining',
    level: 'A2',
    targetGrammar: 'Polite requests with "Could I have..." and "I would like..."',
    targetPhrases: [
      {
        phrase: 'Could we get a table for two by the window, please?',
        translationUz: 'Iltimos, deraza yonidagi ikki kishilik stol bera olasizmi?',
        phonetic: '/kʊd wiː get ə ˈteɪbl fɔː tuː baɪ ðə ˈwɪndəʊ pliːz/',
        usageNote: 'Natural, polite arrival request.',
      },
      {
        phrase: "Does this dish contain any nuts or dairy? I'm allergic.",
        translationUz: 'Bu taomda yongʻoq yoki sut mahsuloti bormi? Menda allergiya bor.',
        phonetic: '/dʌz ðɪs dɪʃ kənˈteɪn ˈeni nʌts ɔː ˈdeəri aɪm əˈlɜːdʒɪk/',
        usageNote: 'Essential phrase for dietary safety.',
      },
      {
        phrase: 'Could you bring the bill when you have a moment?',
        translationUz: 'Boʻsh boʻlganingizda hisobni olib kelib bera olasizmi?',
        phonetic: '/kʊd juː brɪŋ ðə bɪl wen juː hæv ə ˈməʊmənt/',
        usageNote: 'Courteous way to ask for the bill without rushing staff.',
      },
    ],
    practiceTasks: [
      {
        prompt: 'Ask the waiter for vegetarian options politely.',
        expectedStructure: 'Could you tell me if you have...?',
        sampleAnswer: 'Excuse me, could you tell me if you have any vegetarian pasta dishes?',
      },
    ],
    applyStarter: 'Welcome to Olive Bistro! Good evening, do you have a reservation tonight?',
  },
  {
    id: 'lesson-3',
    title: 'Job Interview: Pitching Your Strengths',
    topic: 'Career & Professional Growth',
    level: 'B2',
    targetGrammar: 'Present perfect continuous & action verbs (I have been focusing on...)',
    targetPhrases: [
      {
        phrase: 'Over the past three years, I have specialized in frontend optimization.',
        translationUz: 'Oxirgi uch yil davomida men frontendni optimallashtirishga ixtisoslashdim.',
        phonetic: '/ˈəʊvə ðə pɑːst θriː jɪəz aɪ hæv ˈspeʃəlaɪzd ɪn ˈfrʌntend ˌɒptɪmaɪˈzeɪʃn/',
        usageNote: 'Great opening response for "Tell me about your background".',
      },
      {
        phrase: 'One of my key strengths is breaking down complex problems into clear steps.',
        translationUz: 'Mening asosiy kuchli tomonlarimdan biri — murakkab muammolarni aniq bosqichlarga ajratishdir.',
        phonetic: '/wʌn əv maɪ kiː streŋθs ɪz ˈbreɪkɪŋ daʊn ˈkɒmpleks ˈprɒbləmz ˈɪntuː klɪə steps/',
        usageNote: 'Demonstrates analytical mindset with tangible examples.',
      },
      {
        phrase: 'I thrive in collaborative teams where rapid learning is encouraged.',
        translationUz: 'Men tez oʻrganish ragʻbatlantiriladigan hamkorlik jamoalarida rivojlanaman.',
        phonetic: '/aɪ θraɪv ɪn kəˈlæbərətɪv tiːmz weə ˈræpɪd ˈlɜːnɪŋ ɪz ɪnˈkʌrɪdʒd/',
        usageNote: 'Cultural fit statement showing energy and growth.',
      },
    ],
    practiceTasks: [
      {
        prompt: 'Answer the question: "Why should we hire you for this role?"',
        expectedStructure: 'Combine a key strength with recent experience.',
        sampleAnswer: 'One of my key strengths is communication, and over the past few years I have led multiple successful projects.',
      },
    ],
    applyStarter: "Good morning! Thanks for joining us today. Could you tell me a little bit about yourself and your background?",
  },
];

export const LessonsTab: React.FC<LessonsTabProps> = ({ currentLevel, onStartLessonConversation }) => {
  const [selectedLesson, setSelectedLesson] = useState<SpeakingLesson>(DEFAULT_LESSONS[0]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [speakingPhraseIdx, setSpeakingPhraseIdx] = useState<number | null>(null);

  // Practice state
  const [practiceInput, setPracticeInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ score: number; commentUz: string } | null>(null);

  // Custom AI Lesson generator modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlayAudio = (text: string, idx: number) => {
    setSpeakingPhraseIdx(idx);
    ttsService.speak(text, {
      onEnd: () => setSpeakingPhraseIdx(null),
    });
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      speechRecognitionService.stopListening();
      setIsRecording(false);
      evaluatePractice(practiceInput);
    } else {
      setPracticeInput('');
      setPracticeFeedback(null);
      setIsRecording(true);
      const unsub = speechRecognitionService.onResult((transcript: string) => {
        setPracticeInput(transcript);
      });
      speechRecognitionService.startListening();
      // Store unsub or keep listening until stopped
    }
  };

  const evaluatePractice = (text: string) => {
    if (!text.trim()) return;
    const lower = text.toLowerCase();
    const task = selectedLesson.practiceTasks[0];
    const matchCount = (task.expectedStructure.toLowerCase().match(/\w+/g) || []).filter((w) => lower.includes(w)).length;
    const score = Math.min(100, Math.max(65, 75 + matchCount * 8));

    setPracticeFeedback({
      score,
      commentUz:
        score >= 85
          ? 'Ajoyib! Siz strukturani tabiiy va aniq qoʻlladingiz.'
          : 'Yaxshi urinish! Fikringizni yanada toʻliq ifodalash uchun namuna gapga eʼtibor bering.',
    });
  };

  const handleGenerateCustomLesson = async () => {
    if (!customTopic.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await aiService.generateSpeakingLesson(customTopic, currentLevel);
      if (generated) {
        setSelectedLesson(generated);
        setShowCustomModal(false);
        setActiveStep(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar with lesson selector and AI builder button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              3-Stage Mastery
            </span>
            <span className="text-xs text-slate-400">Level: {selectedLesson.level}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">{selectedLesson.title}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{selectedLesson.targetGrammar}</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLesson.id}
            onChange={(e) => {
              const found = DEFAULT_LESSONS.find((l) => l.id === e.target.value);
              if (found) {
                setSelectedLesson(found);
                setActiveStep(1);
                setPracticeFeedback(null);
                setPracticeInput('');
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
          >
            {DEFAULT_LESSONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} ({l.level})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI Create Lesson
          </button>
        </div>
      </div>

      {/* 3 Steps Navigation Pills */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 1
              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              activeStep === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            1
          </div>
          <div>
            <div className="font-semibold text-sm">Stage 1: Learn</div>
            <div className="text-xs text-slate-400">Target phrases & phonetics</div>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 2
              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              activeStep === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            2
          </div>
          <div>
            <div className="font-semibold text-sm">Stage 2: Practice</div>
            <div className="text-xs text-slate-400">Prompt responses & speech check</div>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 3
              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              activeStep === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            3
          </div>
          <div>
            <div className="font-semibold text-sm">Stage 3: Apply</div>
            <div className="text-xs text-slate-400">Real dialogue with AI Teacher</div>
          </div>
        </button>
      </div>

      {/* Stage 1 Content: Learn Phrases */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-200">
              Key Phrases for this Lesson ({selectedLesson.targetPhrases.length})
            </h3>
            <span className="text-xs text-slate-400">Tinglang, takrorlang va maʼnosini oʻrganing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedLesson.targetPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-100 text-base leading-snug">{phrase.phrase}</p>
                    <button
                      onClick={() => handlePlayAudio(phrase.phrase, idx)}
                      className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                        speakingPhraseIdx === idx
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs font-mono text-emerald-400/90 mb-2">{phrase.phonetic}</div>
                  <div className="text-sm text-slate-300 mb-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                    🇺🇿 {phrase.translationUz}
                  </div>
                </div>

                <div className="text-xs text-slate-400 italic border-t border-slate-800/80 pt-2">
                  💡 {phrase.usageNote}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Continue to Practice
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2 Content: Practice Prompts */}
      {activeStep === 2 && (
        <div className="space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Active Speaking Challenge
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              {selectedLesson.practiceTasks[0]?.prompt || 'Answer using the learned phrase'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Structure hint: <span className="text-slate-300 font-medium">{selectedLesson.practiceTasks[0]?.expectedStructure}</span>
            </p>
          </div>

          {/* Interactive Speech Input / Test */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Microphone Input:</span>
              <button
                onClick={handleToggleRecord}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {isRecording ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Listening (Click to stop)' : 'Speak your answer'}
              </button>
            </div>

            <textarea
              value={practiceInput}
              onChange={(e) => setPracticeInput(e.target.value)}
              placeholder="Or write/paste your response here to test..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm outline-none focus:border-emerald-500 resize-none"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => evaluatePractice(practiceInput)}
                disabled={!practiceInput.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Check Structure
              </button>

              <button
                onClick={() => setPracticeInput(selectedLesson.practiceTasks[0]?.sampleAnswer || '')}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Show sample answer
              </button>
            </div>

            {/* Practice Feedback Banner */}
            {practiceFeedback && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  practiceFeedback.score >= 80
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Score: {practiceFeedback.score}%</div>
                  <div className="text-xs mt-0.5">{practiceFeedback.commentUz}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveStep(1)}
              className="text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Back to Phrases
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Proceed to Dialogue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 3 Content: Apply in Dialogue */}
      {activeStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <MessageSquare className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-100">Ready for Live Dialogue?</h3>
            <p className="text-sm text-slate-400 mt-2">
              Your 3D AI Teacher will start the conversation using the starter prompt:
            </p>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-slate-200 italic text-sm mt-3 font-medium">
              "{selectedLesson.applyStarter}"
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onStartLessonConversation(selectedLesson)}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Launch Conversation with Teacher
            </button>
          </div>
        </div>
      )}

      {/* Custom AI Lesson Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Speaking Lesson Generator
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter any topic, scenario, or situation you wish to master. AI will generate target phrases, phonetics, and dialogue practice for your level ({currentLevel}).
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Topic or Scenario</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Asking for a salary raise, Renting an apartment..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomLesson}
                disabled={!customTopic.trim() || isGenerating}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
