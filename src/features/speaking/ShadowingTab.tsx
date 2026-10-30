import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CEFRLevel } from '../../types';
import { ttsService } from '../../services/tts/ttsService';

interface ShadowingPassage {
  id: string;
  title: string;
  level: CEFRLevel;
  category: string;
  fullText: string;
  sentences: string[];
  translationUz: string;
}

const PASSAGES: ShadowingPassage[] = [
  {
    id: 'pass-1',
    title: 'Stay Hungry, Stay Foolish',
    level: 'B2',
    category: 'Inspiration & Mindset',
    fullText:
      'Your time is limited, so do not waste it living someone else’s life. Do not be trapped by dogma, which is living with the results of other people’s thinking. Most importantly, have the courage to follow your heart and intuition. They somehow already know what you truly want to become.',
    sentences: [
      'Your time is limited, so do not waste it living someone else’s life.',
      'Do not be trapped by dogma, which is living with the results of other people’s thinking.',
      'Most importantly, have the courage to follow your heart and intuition.',
      'They somehow already know what you truly want to become.',
    ],
    translationUz:
      'Sizning vaqtingiz chegaralangan, shuning uchun uni boshqa birovning hayotini yashashga sarflamang. Eng muhimi, yuragingiz va ichki sezgingizga ergashishga jasoratingiz yetsin.',
  },
  {
    id: 'pass-2',
    title: 'The Power of Morning Routines',
    level: 'A2',
    category: 'Daily Habits',
    fullText:
      'How you start your morning often sets the tone for your whole day. Drinking a glass of water, breathing fresh air, and reading for ten minutes can clear your mind completely. Start small, stay consistent, and watch your focus improve.',
    sentences: [
      'How you start your morning often sets the tone for your whole day.',
      'Drinking a glass of water, breathing fresh air, and reading for ten minutes can clear your mind completely.',
      'Start small, stay consistent, and watch your focus improve.',
    ],
    translationUz:
      'Ertalabki vaqtingizni qanday boshlashingiz butun kuningiz kayfiyatini belgilab beradi. Kichik qadamlardan boshlang va diqqatingiz qanday oshishini koʻring.',
  },
  {
    id: 'pass-3',
    title: 'Active Listening in Modern Teams',
    level: 'B1',
    category: 'Communication',
    fullText:
      'True communication is not just about speaking clearly. It requires you to listen with genuine curiosity. When colleagues feel heard and respected, collaboration becomes effortless, and creative solutions emerge naturally.',
    sentences: [
      'True communication is not just about speaking clearly.',
      'It requires you to listen with genuine curiosity.',
      'When colleagues feel heard and respected, collaboration becomes effortless, and creative solutions emerge naturally.',
    ],
    translationUz:
      'Haqiqiy muloqot faqat aniq gapirishdan iborat emas. Hamkasblaringiz oʻzlarini eshitilgan his qilganda, ijodiy yechimlar tabiiy ravishda paydo boʻladi.',
  },
  {
    id: 'pass-4',
    title: 'Artificial Intelligence & Human Creativity',
    level: 'C1',
    category: 'Technology & Ethics',
    fullText:
      'As machine intelligence evolves exponentially, our definition of creative mastery undergoes profound re-examination. The most resilient professionals will not be those who resist automated tools, but those who orchestrate them with empathy, critical discernment, and philosophical clarity.',
    sentences: [
      'As machine intelligence evolves exponentially, our definition of creative mastery undergoes profound re-examination.',
      'The most resilient professionals will not be those who resist automated tools, but those who orchestrate them with empathy, critical discernment, and philosophical clarity.',
    ],
    translationUz:
      'Mashina intellekti rivojlanar ekan, ijodkorlik tushunchasi chuqur qayta koʻrib chiqiladi. Eng kuchli mutaxassislar texnologiyaga empatiya va tanqidiy fikrlash bilan rahbarlik qiladiganlar boʻladi.',
  },
];

export const ShadowingTab: React.FC = () => {
  const [selectedPassage, setSelectedPassage] = useState<ShadowingPassage>(PASSAGES[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Audio Recording (User's voice)
  const [isRecordingUser, setIsRecordingUser] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      ttsService.stop();
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    };
  }, [userAudioUrl]);

  const handlePlayFull = (speed = playbackSpeed) => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      setActiveSentenceIdx(null);
      return;
    }

    setIsPlaying(true);
    let sIdx = 0;

    const playNextSentence = () => {
      if (sIdx >= selectedPassage.sentences.length) {
        setIsPlaying(false);
        setActiveSentenceIdx(null);
        return;
      }

      setActiveSentenceIdx(sIdx);
      const sentence = selectedPassage.sentences[sIdx];
      sIdx++;

      ttsService.speak(sentence, {
        rate: speed,
        onEnd: () => {
          setTimeout(playNextSentence, 350);
        },
      });
    };

    playNextSentence();
  };

  const handlePlaySingle = (sentence: string, idx: number) => {
    setActiveSentenceIdx(idx);
    setIsPlaying(true);
    ttsService.speak(sentence, {
      rate: playbackSpeed,
      onEnd: () => {
        setIsPlaying(false);
        setActiveSentenceIdx(null);
      },
    });
  };

  // User Voice Recording Handling
  const startUserRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
        const url = URL.createObjectURL(audioBlob);
        setUserAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingUser(true);
    } catch (e) {
      console.error('Mic access failed for shadowing:', e);
    }
  };

  const stopUserRecording = () => {
    if (mediaRecorderRef.current && isRecordingUser) {
      mediaRecorderRef.current.stop();
      setIsRecordingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Shadowing Technique
            </span>
            <span className="text-xs text-slate-400">Rhythm, Intonation & Native Cadence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">{selectedPassage.title}</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Tinglang va diktor bilan bir vaqtda soʻzma-soʻz takrorlang (Shadowing metodi)
          </p>
        </div>

        <select
          value={selectedPassage.id}
          onChange={(e) => {
            const found = PASSAGES.find((p) => p.id === e.target.value);
            if (found) {
              setSelectedPassage(found);
              ttsService.stop();
              setIsPlaying(false);
              setActiveSentenceIdx(null);
            }
          }}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-violet-500"
        >
          {PASSAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.level})
            </option>
          ))}
        </select>
      </div>

      {/* 5-Step Progress Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {[
          { step: 1, title: '1. Listen', desc: 'Normal speed' },
          { step: 2, title: '2. Listen Slow', desc: '0.75x focus' },
          { step: 3, title: '3. Sentence Repeat', desc: 'Pause & mirror' },
          { step: 4, title: '4. Full Shadow', desc: 'Speak together' },
          { step: 5, title: '5. Compare', desc: 'Record & evaluate' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setActiveStep(item.step as any)}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activeStep === item.step
                ? 'bg-violet-500/10 border-violet-500/50 text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold">{item.title}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
          </button>
        ))}
      </div>

      {/* Main Shadowing Text & Player Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlayFull()}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-violet-600/20"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Play Passage'}
            </button>

            <button
              onClick={() => {
                ttsService.stop();
                setIsPlaying(false);
                setActiveSentenceIdx(null);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Stop & Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Speed:
            </span>
            {[0.75, 0.85, 1.0, 1.15].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Text with Active Sentence Highlight */}
        <div className="space-y-3">
          {selectedPassage.sentences.map((sentence, idx) => {
            const isActive = activeSentenceIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => handlePlaySingle(sentence, idx)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  isActive
                    ? 'bg-violet-500/15 border-violet-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1">
                  <p
                    className={`text-base leading-relaxed ${
                      isActive ? 'text-violet-200 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    {sentence}
                  </p>
                </div>

                <button
                  className={`p-1.5 rounded-lg transition shrink-0 ${
                    isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Play this sentence"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Uzbek Translation Reference */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-400 block mb-1">🇺🇿 Oʻzbekcha maʼnosi:</span>
          {selectedPassage.translationUz}
        </div>

        {/* Record & Compare Section */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                Step 5: Record & Self-Compare
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Oʻz ovozingizni yozib oling va diktor talaffuzi bilan taqqoslang
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isRecordingUser ? (
                <button
                  onClick={stopUserRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl animate-pulse cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startUserRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Record My Shadowing
                </button>
              )}
            </div>
          </div>

          {userAudioUrl && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Your Shadowing Recording</div>
                  <div className="text-[10px] text-slate-400">Tinglab oʻzingizning ohang va toʻxtamlaringizni tekshiring</div>
                </div>
              </div>

              <audio controls src={userAudioUrl} className="h-9 w-full md:w-64" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
