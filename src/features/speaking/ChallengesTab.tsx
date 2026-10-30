import React, { useState } from 'react';
import {
  Flame,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  ShieldAlert,
  Target,
  Trophy,
} from 'lucide-react';

interface DailyChallenge {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  durationMinutes: number;
  descriptionUz: string;
  ruleUz: string;
  completed: boolean;
  icon: string;
  prompt: string;
}

interface ChallengesTabProps {
  onStartChallenge: (challengeTitle: string, prompt: string) => void;
}

const DEFAULT_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch-1',
    title: '3-Minute Non-Stop Talk',
    category: 'Fluency & Stamina',
    xpReward: 150,
    durationMinutes: 3,
    descriptionUz: 'Toʻxtamasdan 3 daqiqa davomida bitta mavzuda inglizcha gapiring.',
    ruleUz: 'Pauza 4 soniyadan oshmasligi kerak. Oʻqituvchi sizni savollar bilan qoʻllab-quvvatlaydi.',
    completed: true,
    icon: '⚡',
    prompt:
      "Welcome to the 3-Minute Non-Stop Talk Challenge! The timer is running. Tell me about your favourite hobby or passion. Why do you enjoy it, and how did you start?",
  },
  {
    id: 'ch-2',
    title: 'Zero Uzbek (100% English Immersion)',
    category: 'Immersion',
    xpReward: 200,
    durationMinutes: 5,
    descriptionUz: 'Butun suhbat davomida bitta ham oʻzbekcha soʻz ishlatmasdan fikr bildiring.',
    ruleUz: 'Soʻz esdan chiqsa, inglizcha taʼriflang (paraphrase). Oʻzbekcha gapirsangiz ogohlantirish beriladi.',
    completed: false,
    icon: '🛡️',
    prompt:
      "This is the Zero Uzbek Immersion Challenge! From this moment on, only English is allowed. Even if you forget a word, describe it in English. Tell me: what was the highlight of your week so far?",
  },
  {
    id: 'ch-3',
    title: 'Use 5 New Words in Context',
    category: 'Active Vocabulary',
    xpReward: 180,
    durationMinutes: 4,
    descriptionUz: 'Berilgan 5 ta ilgʻor soʻzni (crucial, inevitable, resilience, enhance, perspective) nutqingizda ishlating.',
    ruleUz: 'Har bir soʻz toʻgʻri maʼnoda qoʻllanganda ball beriladi.',
    completed: false,
    icon: '🎯',
    prompt:
      "Today's Vocabulary Activation Challenge! Your target words are: crucial, inevitable, resilience, enhance, and perspective. Let's talk about overcoming personal or career challenges. Start whenever you are ready!",
  },
  {
    id: 'ch-4',
    title: 'Describe an Everyday Scene in 60s',
    category: 'Spontaneity',
    xpReward: 120,
    durationMinutes: 2,
    descriptionUz: 'Berilgan qiziqarli vaziyatni 60 soniya ichida batafsil tasvirlab bering.',
    ruleUz: 'Ranglar, harakatlar va his-tuygʻularni ifoda etuvchi sifatlardan foydalaning.',
    completed: false,
    icon: '🖼️',
    prompt:
      "Picture Description Challenge! Imagine a bustling morning outdoor market in a rainy European city with colorful umbrellas and warm pastries. Describe what you see, smell, and feel in full detail!",
  },
];

export const ChallengesTab: React.FC<ChallengesTabProps> = ({ onStartChallenge }) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DEFAULT_CHALLENGES);
  const [streakDays, setStreakDays] = useState(6);
  const [totalXp, setTotalXp] = useState(840);

  const toggleComplete = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = !c.completed;
          setTotalXp((x) => (next ? x + c.xpReward : x - c.xpReward));
          return { ...c, completed: next };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Streak & Daily XP Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{streakDays} Days</div>
            <div className="text-xs text-slate-400">Daily Speaking Streak</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{totalXp} XP</div>
            <div className="text-xs text-slate-400">Total Speaking Experience</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {challenges.filter((c) => c.completed).length} / {challenges.length}
            </div>
            <div className="text-xs text-slate-400">Today's Challenges Complete</div>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Today's Missions
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                ch.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-base">{ch.title}</h4>
                      <span className="text-xs text-slate-400">{ch.category}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-full">
                    +{ch.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2">{ch.descriptionUz}</p>
                <div className="text-[11px] text-slate-400 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  ⚠️ <span className="font-semibold text-slate-300">Qoida:</span> {ch.ruleUz}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{ch.durationMinutes} min</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleComplete(ch.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      ch.completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {ch.completed ? '✓ Completed' : 'Mark Done'}
                  </button>

                  <button
                    onClick={() => onStartChallenge(ch.title, ch.prompt)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
