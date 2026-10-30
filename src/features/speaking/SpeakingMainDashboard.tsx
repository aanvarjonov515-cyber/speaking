import React, { useState, useEffect } from 'react';
import {
  Mic,
  MessageSquare,
  BookOpen,
  Sparkles,
  Users,
  Headphones,
  Flame,
  Award,
  Layers,
  Settings,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Volume2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CEFRLevel, RolePlayScenario, SpeakingLesson, SpeakingProgressData, TeacherProfile } from '../../types';
import { globalTeacherManager } from '../../services/teacher/globalTeacherManager';
import { DBService } from '../../services/database/dbService';
import { MicSetupModal } from './MicSetupModal';
import { SpeakingTalkWorkspace } from './SpeakingTalkWorkspace';
import { RolePlayTab } from './RolePlayTab';
import { LessonsTab } from './LessonsTab';
import { PronunciationTab } from './PronunciationTab';
import { ShadowingTab } from './ShadowingTab';
import { ReadAndTalkTab } from './ReadAndTalkTab';
import { ChallengesTab } from './ChallengesTab';
import { ReviewTab } from './ReviewTab';

type SpeakingSubTab =
  | 'talk'
  | 'lessons'
  | 'roleplay'
  | 'pronunciation'
  | 'shadowing'
  | 'read_and_talk'
  | 'challenges'
  | 'review';

interface SpeakingMainDashboardProps {
  initialSubTab?: SpeakingSubTab;
  initialReadingContext?: { title: string; content: string } | null;
  onOpenSettings?: () => void;
}

export const SpeakingMainDashboard: React.FC<SpeakingMainDashboardProps> = ({
  initialSubTab = 'talk',
  initialReadingContext = null,
  onOpenSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SpeakingSubTab>(initialSubTab);
  const [profile, setProfile] = useState<TeacherProfile>(globalTeacherManager.getProfile());
  const [progress, setProgress] = useState<SpeakingProgressData>(DBService.getSpeakingProgress());
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>('B1');
  const [showMicSetup, setShowMicSetup] = useState(false);

  // Active Session state (switches to SpeakingTalkWorkspace)
  const [isInActiveSession, setIsInActiveSession] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('Daily Life & Future Goals');
  const [sessionMode, setSessionMode] = useState<'talk' | 'lesson' | 'roleplay' | 'read_and_talk' | 'challenge'>('talk');
  const [activeScenario, setActiveScenario] = useState<RolePlayScenario | null>(null);
  const [readingContext, setReadingContext] = useState<string | null>(
    initialReadingContext ? initialReadingContext.content : null
  );

  useEffect(() => {
    const unsub = globalTeacherManager.onProfileChange(setProfile);
    setProgress(DBService.getSpeakingProgress());
    return () => {
      unsub();
    };
  }, []);

  const handleStartTalk = (
    topic = 'Everyday Conversation',
    mode: 'talk' | 'lesson' | 'roleplay' | 'read_and_talk' | 'challenge' = 'talk',
    scenario: RolePlayScenario | null = null,
    context: string | null = null
  ) => {
    setSessionTopic(topic);
    setSessionMode(mode);
    setActiveScenario(scenario);
    setReadingContext(context);
    setIsInActiveSession(true);
  };

  const handleExitSession = () => {
    setIsInActiveSession(false);
    setActiveScenario(null);
    setReadingContext(null);
    setProgress(DBService.getSpeakingProgress());
  };

  // If inside active talk session, render full workspace
  if (isInActiveSession) {
    return (
      <SpeakingTalkWorkspace
        topic={sessionTopic}
        mode={sessionMode}
        scenario={activeScenario}
        readingContext={readingContext}
        onExit={handleExitSession}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Metrics & Teacher Presence */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-xl shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Teacher {profile.name} • {profile.personality}
              </span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400">Voice: {profile.preferredUzbekVoiceId.replace('uz_', '')}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Professional Speaking Studio</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haqiqiy 3D AI oʻqituvchi bilan muloqot qiling, talaffuzni charxlang va erkin gapirishni oʻrganing
            </p>
          </div>
        </div>

        {/* Quick Stats & Level Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Level Dropdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Level:</span>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as CEFRLevel)}
              className="bg-transparent text-emerald-400 font-bold text-xs outline-none cursor-pointer"
            >
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Upper-Int</option>
              <option value="C1">C1 Advanced</option>
            </select>
          </div>

          {/* Daily Minutes Tracker */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-400">
              {progress.todayMinutesSpoken}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {progress.todayMinutesSpoken} / 15 min
              </div>
              <div className="text-[10px] text-slate-400">Bugungi maqsad</div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-base">🔥</span>
            <div>
              <div className="text-xs font-bold text-slate-200">{progress.streakDays} kun</div>
              <div className="text-[10px] text-slate-400">Ketma-ketlik</div>
            </div>
          </div>

          {/* Mic Setup Button */}
          <button
            onClick={() => setShowMicSetup(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition cursor-pointer border border-slate-700"
            title="Configure Microphone"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            Mic Setup
          </button>
        </div>
      </div>

      {/* 8 Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'talk', label: 'Talk (AI Voice)', icon: MessageSquare },
          { id: 'lessons', label: 'Lessons', icon: BookOpen },
          { id: 'roleplay', label: 'Role Play', icon: Users },
          { id: 'pronunciation', label: 'Pronunciation', icon: Volume2 },
          { id: 'shadowing', label: 'Shadowing', icon: Headphones },
          { id: 'read_and_talk', label: 'Read & Talk', icon: Layers },
          { id: 'challenges', label: 'Challenges', icon: Flame },
          { id: 'review', label: 'Review & Mistakes', icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SpeakingSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeSubTab === 'talk' && (
        <div className="space-y-6">
          {/* Hero Start Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="max-w-xl space-y-4 relative z-10">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live 3D AI Teacher Conversation
              </span>

              <h2 className="text-3xl font-black text-slate-100 tracking-tight leading-tight">
                Ingliz tilida xatosiz va erkin gapirishni boshlang
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                3D oʻqituvchi bilan xohlagan mavzuda suhbatlashing. Dastur talaffuzingizni tinglaydi, noaniqliklarni
                muloyimlik bilan toʻgʻrilaydi va nutqingizni boyitishga yordam beradi.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleStartTalk('Free Conversation & Daily Life', 'talk')}
                  className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl text-base shadow-lg shadow-emerald-500/25 transition transform active:scale-98 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Conversation Now
                </button>

                <button
                  onClick={() => setActiveSubTab('roleplay')}
                  className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-sm transition cursor-pointer border border-slate-700"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  Choose Scenario
                </button>
              </div>
            </div>

            {/* Subtle decorative background circles */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Quick Start Suggested Topics */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Suggested Conversation Starters
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Career & Ambitions',
                  desc: 'Talk about your professional goals, coding, and dream projects.',
                  icon: '💼',
                  topic: 'My Career Goals & Work Life',
                },
                {
                  title: 'Travel & Cultures',
                  desc: 'Describe memorable trips, dream destinations, and cuisines.',
                  icon: '✈️',
                  topic: 'Travel Experiences & Dream Places',
                },
                {
                  title: 'Technology & AI',
                  desc: 'Share thoughts on artificial intelligence, gadgets, and the future.',
                  icon: '🤖',
                  topic: 'The Impact of AI on Future Jobs',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStartTalk(item.topic, 'talk')}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-3xl mb-3 block">{item.icon}</span>
                    <h4 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>Start topic</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'lessons' && (
        <LessonsTab
          currentLevel={currentLevel}
          onStartLessonConversation={(lesson) =>
            handleStartTalk(lesson.title, 'lesson', null, lesson.targetPhrases.map((p) => p.phrase).join('; '))
          }
        />
      )}

      {activeSubTab === 'roleplay' && (
        <RolePlayTab
          onStartScenario={(sc: RolePlayScenario) => handleStartTalk(sc.title, 'roleplay', sc)}
        />
      )}

      {activeSubTab === 'pronunciation' && <PronunciationTab />}

      {activeSubTab === 'shadowing' && <ShadowingTab />}

      {activeSubTab === 'read_and_talk' && (
        <ReadAndTalkTab
          onStartDiscussion={(topic, content, vocab) =>
            handleStartTalk(topic, 'read_and_talk', null, `Context: ${content}\nTarget Vocabulary: ${vocab.join(', ')}`)
          }
        />
      )}

      {activeSubTab === 'challenges' && (
        <ChallengesTab
          onStartChallenge={(title, prompt) => handleStartTalk(title, 'challenge', null, prompt)}
        />
      )}

      {activeSubTab === 'review' && <ReviewTab />}

      {/* Mic Setup Modal */}
      {showMicSetup && (
        <MicSetupModal
          isOpen={showMicSetup}
          onClose={() => setShowMicSetup(false)}
        />
      )}
    </div>
  );
};
