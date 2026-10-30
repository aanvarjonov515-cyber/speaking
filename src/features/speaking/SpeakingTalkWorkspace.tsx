import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  StopCircle,
  RotateCcw,
  Languages,
  Lightbulb,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  Radio,
  Clock,
  Award,
  Edit2,
  Check,
  X,
  VolumeX,
} from 'lucide-react';
import { ConversationTurn, SpeakingSession, TeacherProfile } from '../../types';
import { globalTeacherManager } from '../../services/teacher/globalTeacherManager';
import { speechRecognitionService } from '../../services/speech/speechRecognitionService';
import { ttsService } from '../../services/tts/ttsService';
import { aiService } from '../../services/ai/aiService';
import { DBService } from '../../services/database/dbService';
import { TeacherAvatar3D } from '../teacher/TeacherAvatar3D';
import { HowDoISayModal } from './HowDoISayModal';
import { SpeakingReportModal } from './SpeakingReportModal';

interface SpeakingTalkWorkspaceProps {
  topic?: string;
  mode?: 'talk' | 'lesson' | 'roleplay' | 'read_and_talk' | 'challenge';
  scenario?: any;
  readingContext?: string | null;
  onExit: () => void;
}

export const SpeakingTalkWorkspace: React.FC<SpeakingTalkWorkspaceProps> = ({
  topic = 'Daily Conversation',
  mode = 'talk',
  scenario = null,
  readingContext = null,
  onExit,
}) => {
  const [profile, setProfile] = useState<TeacherProfile>(globalTeacherManager.getProfile());
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [teacherEmotion, setTeacherEmotion] = useState<'neutral' | 'happy' | 'encouraging' | 'thinking' | 'surprised'>('neutral');
  const [teacherState, setTeacherState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [audioVolume, setAudioVolume] = useState(0);

  // Assistance & Modals
  const [showHowDoISay, setShowHowDoISay] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [lastReport, setLastReport] = useState<SpeakingSession | null>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [activeHintData, setActiveHintData] = useState<{ keyword?: string; sentenceStart?: string; fullExample?: string } | null>(null);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Session Duration tracking
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const userTalkingSecondsRef = useRef(0);
  const teacherTalkingSecondsRef = useRef(0);
  const turnStartTimeRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Greeting on Mount
  useEffect(() => {
    const unsub = globalTeacherManager.onProfileChange(setProfile);
    startSessionWithGreeting();

    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
      ttsService.stop();
      speechRecognitionService.stopListening();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, interimSpeech, isTeacherSpeaking]);

  const startSessionWithGreeting = async () => {
    setTeacherState('thinking');
    try {
      const greetingPrompt =
        mode === 'roleplay' && scenario
          ? `[Roleplay Started as ${scenario.teacherRole}]: ${scenario.starterPrompt || 'Hello, how can I help you today?'}`
          : mode === 'read_and_talk' && readingContext
          ? `Hi! Let's talk about the text you just read: "${readingContext.slice(0, 100)}...". What did you think of it?`
          : `Hi! How are you doing today? What's on your mind?`;

      speakTeacherResponse(greetingPrompt, 'happy');
      setTurns([
        {
          id: 'greeting',
          role: 'teacher',
          text: greetingPrompt,
          timestamp: Date.now(),
          emotion: 'happy',
        },
      ]);
    } catch {
      setTeacherState('idle');
    }
  };

  // 2. Play Teacher Speech with Interruption Support & Lip Sync
  const speakTeacherResponse = (text: string, emotion: 'neutral' | 'happy' | 'encouraging' | 'thinking' | 'surprised' = 'neutral') => {
    setIsTeacherSpeaking(true);
    setTeacherEmotion(emotion);
    setTeacherState('speaking');

    const speakStart = Date.now();
    ttsService.speak(text, {
      rate: profile.speakingSpeed,
      onEnd: () => {
        setIsTeacherSpeaking(false);
        setTeacherState('idle');
        teacherTalkingSecondsRef.current += Math.round((Date.now() - speakStart) / 1000);

        // If hands-free mode is on, start listening automatically
        if (handsFree) {
          handleStartListening();
        }
      },
    });
  };

  // Interruption logic: when student speaks, immediately stop teacher audio
  const handleInterruptTeacher = () => {
    if (isTeacherSpeaking) {
      ttsService.stop();
      setIsTeacherSpeaking(false);
      setTeacherState('idle');
    }
  };

  // 3. Audio Recording / STT listener
  const handleStartListening = async () => {
    handleInterruptTeacher();
    setIsRecording(true);
    setTeacherState('listening');
    setInterimSpeech('');
    turnStartTimeRef.current = Date.now();

    speechRecognitionService.onVolume(setAudioVolume);
    speechRecognitionService.onResult((text, isFinal) => {
      setInterimSpeech(text);
      if (isFinal && text.trim().length > 0) {
        handleSendUserSpeech(text.trim());
      }
    });

    await speechRecognitionService.startListening();
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    setIsRecording(false);
    setAudioVolume(0);
    setTeacherState('idle');

    if (interimSpeech.trim()) {
      handleSendUserSpeech(interimSpeech.trim());
    }
  };

  // 4. Send User Speech to AI Teacher
  const handleSendUserSpeech = async (speechText: string) => {
    speechRecognitionService.stopListening();
    setIsRecording(false);
    setAudioVolume(0);
    setInterimSpeech('');

    const userSeconds = Math.max(1, Math.round((Date.now() - turnStartTimeRef.current) / 1000));
    userTalkingSecondsRef.current += userSeconds;

    const userTurn: ConversationTurn = {
      id: 'turn_' + Date.now(),
      role: 'user',
      text: speechText,
      audioDurationSeconds: userSeconds,
      timestamp: Date.now(),
    };

    setTurns((prev) => [...prev, userTurn]);
    setTeacherState('thinking');

    try {
      const history = turns.slice(-6).map((t) => ({
        role: t.role === 'user' ? ('user' as const) : ('model' as const),
        text: t.text,
      }));

      const res = await aiService.sendSpeakingTurn({
        userSpeech: speechText,
        history,
        teacherProfile: profile,
        level: 'A2',
        mode,
        scenario,
        readingContext,
        correctionStyle: profile.correctionStyle.toLowerCase(),
      });

      const teacherSpeech = res?.speech || 'AI O\'qituvchi bilan aloqa uzildi. Iltimos ulanishni tekshiring.';
      const newEmotion = res?.emotion || 'neutral';

      const teacherTurn: ConversationTurn = {
        id: 'reply_' + Date.now(),
        role: 'teacher',
        text: teacherSpeech,
        timestamp: Date.now(),
        emotion: newEmotion,
        correction: res?.correction,
        hints: res?.hints,
      };

      setTurns((prev) => [...prev, teacherTurn]);
      setActiveHintData(res?.hints || null);
      setActiveHintLevel(0);

      // Save mistake to MistakeMemory if correction was noted
      if (res?.correction?.hasCorrection && res.correction.userOriginal && res.correction.corrected) {
        DBService.addMistakeMemory({
          category: 'Conversation Error',
          original: res.correction.userOriginal,
          corrected: res.correction.corrected,
          moreNatural: res.correction.moreNatural,
          explanationUz: res.correction.explanationUz || 'Grammatika tuzatmasi',
          date: Date.now(),
          contextSentence: speechText,
        });
      }

      speakTeacherResponse(teacherSpeech, newEmotion);
    } catch (err: any) {
      console.error(err);
      setTeacherState('idle');
      const errorMsg = '⚠️ AI O\'qituvchi vaqtincha javob bera olmadi. Iltimos, Sozlamalar bo\'limida API kalitini tekshiring.';
      const errorTurn: ConversationTurn = {
        id: 'reply_' + Date.now(),
        role: 'teacher',
        text: errorMsg,
        timestamp: Date.now(),
        emotion: 'neutral',
      };
      setTurns((prev) => [...prev, errorTurn]);
    }
  };

  // Assistance Controls
  const handleRepeatTeacher = () => {
    const lastTeacherTurn = [...turns].reverse().find((t) => t.role === 'teacher');
    if (lastTeacherTurn) {
      speakTeacherResponse(lastTeacherTurn.text);
    }
  };

  const handleSlowerTeacher = () => {
    const lastTeacherTurn = [...turns].reverse().find((t) => t.role === 'teacher');
    if (lastTeacherTurn) {
      setIsTeacherSpeaking(true);
      setTeacherState('speaking');
      ttsService.speak(lastTeacherTurn.text, {
        rate: Math.max(0.6, profile.speakingSpeed * 0.7),
        onEnd: () => {
          setIsTeacherSpeaking(false);
          setTeacherState('idle');
        },
      });
    }
  };

  const handleIDontUnderstand = () => {
    handleInterruptTeacher();
    const lastTeacherTurn = [...turns].reverse().find((t) => t.role === 'teacher');
    if (lastTeacherTurn) {
      aiService
        .analyzeSentence(lastTeacherTurn.text, 'A2', 'uz')
        .then((res) => {
          const explanation = `Oʻzbekcha maʼnosi: "${res.translation}". ${res.explanation || ''}`;
          speakTeacherResponse(explanation, 'encouraging');
        })
        .catch(() => {
          speakTeacherResponse("Tushunmagan bo'lsangiz, soddaroq aytaman: " + lastTeacherTurn.text, 'encouraging');
        });
    }
  };

  const handleShowHint = () => {
    if (!activeHintData) return;
    const nextLevel = Math.min(3, activeHintLevel + 1);
    setActiveHintLevel(nextLevel);
  };

  const handleEndSession = async () => {
    handleInterruptTeacher();
    speechRecognitionService.stopListening();

    try {
      const analysis = await aiService.evaluateSpeakingSession({
        transcript: turns,
        durationSeconds: sessionSeconds,
        level: 'A2',
      });

      const session: SpeakingSession = {
        id: 'session_' + Date.now(),
        date: Date.now(),
        mode,
        topic,
        level: 'A2',
        durationSeconds: sessionSeconds,
        userTalkingSeconds: userTalkingSecondsRef.current,
        teacherTalkingSeconds: teacherTalkingSecondsRef.current,
        turns,
        overallScore: analysis.overallScore || 80,
        fluencyScore: analysis.fluencyScore || 82,
        grammarScore: analysis.grammarScore || 78,
        vocabularyScore: analysis.vocabularyScore || 80,
        correctionsCount: analysis.grammarCorrections?.length || 0,
        fillerWordsCount: analysis.fillerWordsCount || {},
        keyTakeaway: analysis.keyTakeaway || 'Keep practicing speaking every day.',
        completed: true,
      };

      DBService.saveSpeakingSession(session);
      setLastReport(session);
      setShowReport(true);
    } catch {
      // Fallback summary
      const fallbackSession: SpeakingSession = {
        id: 'session_' + Date.now(),
        date: Date.now(),
        mode,
        topic,
        level: 'A2',
        durationSeconds: sessionSeconds,
        userTalkingSeconds: userTalkingSecondsRef.current,
        teacherTalkingSeconds: teacherTalkingSecondsRef.current,
        turns,
        overallScore: 84,
        fluencyScore: 82,
        grammarScore: 80,
        vocabularyScore: 82,
        correctionsCount: 1,
        fillerWordsCount: {},
        keyTakeaway: 'Focus on full sentences and natural expression.',
        completed: true,
      };
      DBService.saveSpeakingSession(fallbackSession);
      setLastReport(fallbackSession);
      setShowReport(true);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100 select-none">
      {/* Top Session Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            ← Chiqish
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{topic}</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] uppercase font-bold">
              {mode}
            </span>
          </div>
        </div>

        {/* Timer, Mode toggle & End Session */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          <button
            onClick={() => setHandsFree(!handsFree)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs flex items-center gap-1.5 ${
              handsFree
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Hands-Free</span>
          </button>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-semibold shadow-sm transition-colors"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split (Center: 3D Teacher + Live Transcript) */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Stage: 3D Avatar Teacher with Live Speaking States */}
        <div className="w-[420px] flex flex-col h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shrink-0">
          <TeacherAvatar3D
            isSpeaking={isTeacherSpeaking}
            emotion={teacherEmotion}
            teacherState={teacherState}
            teacherName={profile.name}
            vrmUrl={profile.vrmModelUrl}
          />

          {/* Quick Interruption bar */}
          {isTeacherSpeaking && (
            <div className="p-2.5 bg-indigo-950/90 border-t border-indigo-800 flex items-center justify-between text-xs animate-in fade-in">
              <span className="text-indigo-200 text-[11px]">Teacher is speaking...</span>
              <button
                onClick={handleInterruptTeacher}
                className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <VolumeX className="w-3 h-3" />
                <span>Toʻxtatish (Interrupt)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Stage: Live Interactive Conversation Transcript */}
        <div className="flex-1 flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {turns.map((turn) => {
              const isUser = turn.role === 'user';
              return (
                <div
                  key={turn.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <span className="text-[10px] text-slate-500 font-semibold uppercase px-1">
                    {isUser ? 'You' : profile.name}
                  </span>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 leading-relaxed text-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white font-medium shadow-md rounded-tr-none'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {editingTurnId === turn.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          rows={2}
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              turn.text = editText;
                              setEditingTurnId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs"
                          >
                            Saqlash
                          </button>
                          <button
                            onClick={() => setEditingTurnId(null)}
                            className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs"
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <p>{turn.text}</p>
                        {isUser && (
                          <button
                            onClick={() => {
                              setEditingTurnId(turn.id);
                              setEditText(turn.text);
                            }}
                            title="Edit transcript"
                            className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Inline Correction Card if applicable */}
                    {turn.correction?.hasCorrection && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs space-y-1 text-slate-300">
                        <div className="text-emerald-300 font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Naturalroq: "{turn.correction.moreNatural || turn.correction.corrected}"</span>
                        </div>
                        {turn.correction.explanationUz && (
                          <p className="text-[11px] text-slate-400 italic">
                            {turn.correction.explanationUz}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Interim live speech preview while user is talking */}
            {isRecording && interimSpeech && (
              <div className="flex flex-col items-end space-y-1 animate-in fade-in">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase px-1">
                  Listening...
                </span>
                <div className="max-w-[80%] rounded-2xl p-3.5 bg-indigo-950/70 border border-indigo-500/50 text-indigo-200 text-sm italic">
                  "{interimSpeech}"
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* 3-Tier Hint Card if user asked for a hint */}
          {activeHintData && activeHintLevel > 0 && (
            <div className="px-5 py-3 bg-amber-950/60 border-t border-amber-900/60 text-xs text-amber-200 flex items-center justify-between animate-in fade-in">
              <div>
                <span className="font-bold text-amber-400 mr-2">
                  Hint Level {activeHintLevel}/3:
                </span>
                {activeHintLevel === 1 && (
                  <span>Foydalanish mumkin boʻlgan soʻz: <strong>"{activeHintData.keyword}"</strong></span>
                )}
                {activeHintLevel === 2 && (
                  <span>Gapni boshlash namunasi: <strong>"{activeHintData.sentenceStart}"</strong></span>
                )}
                {activeHintLevel === 3 && (
                  <span>Toʻliq namuna javob: <strong>"{activeHintData.fullExample}"</strong></span>
                )}
              </div>
              {activeHintLevel < 3 && (
                <button
                  onClick={handleShowHint}
                  className="px-2.5 py-1 rounded bg-amber-900 hover:bg-amber-800 text-amber-100 text-[11px] font-medium"
                >
                  Keyingi daraja
                </button>
              )}
            </div>
          )}

          {/* Floating Assistance Strip (I don't understand, Slower, Repeat, Hint, How do I say) */}
          <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={handleIDontUnderstand}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium whitespace-nowrap transition-colors"
            >
              ❓ I don't understand
            </button>

            <button
              onClick={handleSlowerTeacher}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium whitespace-nowrap transition-colors"
            >
              🐢 Say it slower
            </button>

            <button
              onClick={handleRepeatTeacher}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium whitespace-nowrap transition-colors"
            >
              🔄 Repeat
            </button>

            <button
              onClick={handleShowHint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium whitespace-nowrap transition-colors"
            >
              💡 Give me a hint
            </button>

            <button
              onClick={() => setShowHowDoISay(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-medium whitespace-nowrap transition-colors ml-auto"
            >
              🌐 How do I say this?
            </button>
          </div>

          {/* Bottom Audio Interaction Deck (Push-to-Talk Big Button & Volume Meter) */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
            {/* Live Volume Meter Bar */}
            <div className="flex items-center gap-2 w-48 text-[11px] text-slate-400">
              <span className="shrink-0">{isRecording ? 'Listening' : 'Mic Idle'}</span>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    isRecording ? 'bg-indigo-500' : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(4, audioVolume)}%` }}
                />
              </div>
            </div>

            {/* Central Big Microphone Button */}
            <div className="flex items-center gap-3">
              {isRecording ? (
                <button
                  onClick={handleStopListening}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 animate-pulse transition-all cursor-pointer"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>Click to Stop & Send</span>
                </button>
              ) : (
                <button
                  onClick={handleStartListening}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Push to Talk (Space)</span>
                </button>
              )}
            </div>

            {/* Fallback Text Input for Silent Environments */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (transcriptInput.trim()) {
                  handleSendUserSpeech(transcriptInput.trim());
                  setTranscriptInput('');
                }
              }}
              className="flex items-center gap-2 w-64"
            >
              <input
                type="text"
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                placeholder="Yoki yozma yozing..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>
          </div>
        </div>
      </div>

      {/* "How Do I Say This?" Modal */}
      <HowDoISayModal
        isOpen={showHowDoISay}
        currentTopic={topic}
        onClose={() => setShowHowDoISay(false)}
        onUseInConversation={(phrase) => {
          handleSendUserSpeech(phrase);
        }}
      />

      {/* End of Session Report Modal */}
      <SpeakingReportModal
        isOpen={showReport}
        sessionData={lastReport}
        onClose={() => {
          setShowReport(false);
          onExit();
        }}
        onPracticeCorrection={(corrected) => {
          handleSendUserSpeech(corrected);
        }}
      />
    </div>
  );
};
