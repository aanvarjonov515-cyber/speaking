import React, { useState } from 'react';
import {
  Utensils,
  Plane,
  Briefcase,
  Hotel,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { RolePlayScenario } from '../../types';

interface RolePlayTabProps {
  onStartScenario: (scenario: RolePlayScenario) => void;
}

const PRESET_SCENARIOS: RolePlayScenario[] = [
  {
    id: 'rp_restaurant',
    category: 'Daily Life',
    title: 'Ordering at a Restaurant',
    situation: 'You are having lunch at a modern cafe in London.',
    userRole: 'Customer',
    teacherRole: 'Friendly Waiter',
    goal: 'Order a meal, ask about vegetarian options, and ask for the bill.',
    difficulty: 'Easy',
    usefulPhrases: ['Could I see the menu?', 'What do you recommend?', 'Could we have the bill, please?'],
    starterPrompt: 'Good afternoon! Welcome to the Green Cafe. Here is the menu. Can I get you started with something to drink?',
  },
  {
    id: 'rp_hotel',
    category: 'Travel',
    title: 'Hotel Check-In',
    situation: 'You have just arrived at a hotel in New York after a long flight.',
    userRole: 'Guest',
    teacherRole: 'Front Desk Receptionist',
    goal: 'Check into your room, ask about breakfast hours, and ask for Wi-Fi access.',
    difficulty: 'Normal',
    usefulPhrases: ['I have a reservation under my name', 'What time is breakfast served?', 'Is Wi-Fi included?'],
    starterPrompt: 'Hello and welcome to the Grand Central Hotel! Are you checking in today?',
  },
  {
    id: 'rp_airport',
    category: 'Travel',
    title: 'Airport Gate & Luggage',
    situation: 'You are at the international departure terminal checking your baggage.',
    userRole: 'Passenger',
    teacherRole: 'Airline Check-in Agent',
    goal: 'Check your passport, request a window seat, and confirm flight gate.',
    difficulty: 'Normal',
    usefulPhrases: ['Here is my passport', 'Could I have a window seat?', 'Which gate is my flight departing from?'],
    starterPrompt: 'Good morning! May I see your ticket and passport, please?',
  },
  {
    id: 'rp_interview',
    category: 'Career & Work',
    title: 'Tech Job Interview',
    situation: 'You are interviewing for an English-speaking Software Developer position.',
    userRole: 'Candidate',
    teacherRole: 'Senior Tech Lead Interviewer',
    goal: 'Introduce your background, describe a technical challenge you solved, and ask a question.',
    difficulty: 'Realistic',
    usefulPhrases: ['I have experience in full-stack development', 'One major obstacle I faced was...', 'How does the team handle code reviews?'],
    starterPrompt: 'Welcome! Thank you for joining us today. To start off, could you tell us a little bit about yourself and your background?',
  },
  {
    id: 'rp_university',
    category: 'Education',
    title: 'Asking Professor for Extension',
    situation: 'You are speaking with your academic advisor about your coursework deadline.',
    userRole: 'University Student',
    teacherRole: 'University Professor',
    goal: 'Politely explain your situation and request a 3-day assignment extension.',
    difficulty: 'Normal',
    usefulPhrases: ['I wanted to discuss my final essay', 'Due to unexpected circumstances...', 'Would it be possible to get an extension?'],
    starterPrompt: 'Come in! Take a seat. You mentioned in your email you wanted to talk about the term paper?',
  },
];

export const RolePlayTab: React.FC<RolePlayTabProps> = ({ onStartScenario }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [customGoal, setCustomGoal] = useState('');

  const filtered = PRESET_SCENARIOS.filter(
    (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
  );

  const handleStartCustom = () => {
    if (!customGoal.trim()) return;
    const customScenario: RolePlayScenario = {
      id: 'rp_custom_' + Date.now(),
      category: 'Custom',
      title: 'Custom Practice Scenario',
      situation: customGoal.trim(),
      userRole: 'Student',
      teacherRole: 'Speaking Partner',
      goal: customGoal.trim(),
      difficulty: 'Normal',
      usefulPhrases: ['I would like to practice...', 'Can you help me with this?'],
      starterPrompt: `Hello! I see you want to practice: "${customGoal.trim()}". Let's begin! What would you like to start with?`,
    };
    onStartScenario(customScenario);
  };

  return (
    <div className="space-y-6 text-xs text-slate-100 p-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/40 shadow-xl space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Real-Life Role Play Scenarios</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Restoran, aeroport, mehmonxona yoki ish intervyusida haqiqiy suhbat mashqi.
          Oʻqituvchingiz tanlangan rolda gapiradi va vaziyatingizga moslashadi.
        </p>
      </div>

      {/* Custom Scenario Builder */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Oʻzingizning shaxsiy vaziyatingizni yarating (Custom Role Play)</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Masalan: Ertaga universitetda prezentatsiya qilaman, savol-javob mashq qilaylik..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleStartCustom}
            disabled={!customGoal.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-colors shrink-0 shadow-sm"
          >
            Boshlash
          </button>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onStartScenario(item)}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-900 space-y-3.5 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.difficulty === 'Easy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.difficulty === 'Normal'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {item.difficulty}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.situation}</p>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="text-[11px]">
                  <span className="text-slate-400 font-medium">Your Role: </span>
                  <span className="text-slate-200 font-semibold">{item.userRole}</span>
                  <span className="text-slate-600 mx-2">·</span>
                  <span className="text-slate-400 font-medium">Teacher: </span>
                  <span className="text-indigo-300 font-semibold">{item.teacherRole}</span>
                </div>
                <div className="text-[11px]">
                  <span className="text-slate-400 font-medium">Goal: </span>
                  <span className="text-emerald-300">{item.goal}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Suhbatni boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
