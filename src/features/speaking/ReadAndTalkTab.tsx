import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Layers,
  HelpCircle,
  Award,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { ReadingText, CEFRLevel } from '../../types';
import { DBService } from '../../services/database/dbService';

interface ReadAndTalkTabProps {
  onStartDiscussion: (topic: string, readingContent: string, targetVocab: string[]) => void;
}

interface CuratedDiscussionTopic {
  id: string;
  title: string;
  level: CEFRLevel;
  category: string;
  wordCount: number;
  summaryUz: string;
  discussionQuestions: string[];
  targetVocab: string[];
  content: string;
}

const DEFAULT_READING_TOPICS: CuratedDiscussionTopic[] = [
  {
    id: 'rd-1',
    title: 'Atomic Habits & Small Daily Systems',
    level: 'B1',
    category: 'Self Improvement',
    wordCount: 185,
    summaryUz: 'Kichik 1% lik ijobiy oʻzgarishlar uzoq muddatda ulkan natija berishi haqida.',
    discussionQuestions: [
      'What is one small daily habit that positively impacts your life?',
      'Why is it harder to break bad habits than build good ones?',
      'How do you stay motivated on days when you feel exhausted?',
    ],
    targetVocab: ['consistency', 'compound effect', 'discipline', 'routine'],
    content:
      'Habits are the compound interest of self-improvement. Getting one percent better every day counts for a lot in the long run. If you can get one percent better each day for one year, you’ll end up thirty-seven times better by the time you’re done.',
  },
  {
    id: 'rd-2',
    title: 'The Future of Remote Work & Global Teams',
    level: 'B2',
    category: 'Career & Tech',
    wordCount: 220,
    summaryUz: 'Masofaviy ishning afzalliklari, qiyinchiliklari va jamoaviy madaniyatga taʼsiri.',
    discussionQuestions: [
      'Do you prefer working from an office or remotely from home? Why?',
      'What are the biggest challenges when collaborating across time zones?',
      'How can companies maintain team spirit without physical gatherings?',
    ],
    targetVocab: ['flexibility', 'asynchronous', 'productivity', 'isolation'],
    content:
      'Remote work has fundamentally shifted how professionals collaborate. While asynchronous communication grants unmatched flexibility, leaders must deliberately design strategies to prevent digital fatigue and build psychological safety across distributed teams.',
  },
  {
    id: 'rd-3',
    title: 'Artificial Intelligence & The Evolution of Creativity',
    level: 'C1',
    category: 'Technology & Society',
    wordCount: 240,
    summaryUz: 'AI asrida insonning ijodiy qobiliyatlari va unikal afzalligi qanday saqlanib qolishi.',
    discussionQuestions: [
      'Will generative AI replace creative workers or empower them?',
      'What unique qualities do humans possess that machines cannot replicate?',
      'Should students use AI tools when learning languages and writing essays?',
    ],
    targetVocab: ['discernment', 'originality', 'catalyst', 'automation'],
    content:
      'Rather than rendering human creativity obsolete, generative algorithms act as powerful cognitive catalysts. The value in creative pursuits is pivoting from raw execution toward visionary curation, emotional resonance, and ethical discernment.',
  },
];

export const ReadAndTalkTab: React.FC<ReadAndTalkTabProps> = ({ onStartDiscussion }) => {
  const [readingList, setReadingList] = useState<ReadingText[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<CuratedDiscussionTopic>(DEFAULT_READING_TOPICS[0]);

  useEffect(() => {
    const saved = DBService.getReadingTexts();
    setReadingList(saved);
  }, []);

  const handleLaunchDiscussion = (topic: CuratedDiscussionTopic) => {
    onStartDiscussion(topic.title, topic.content, topic.targetVocab);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cross-Module Synergy
            </span>
            <span className="text-xs text-slate-400">Reading to Speaking Transition</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Read & Talk With Teacher</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Oʻqigan matnlaringizni AI oʻqituvchi bilan jonli muhokama qiling va yangi soʻzlarni nutqda faollashtiring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Articles List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Discussion Articles ({DEFAULT_READING_TOPICS.length})
          </div>

          <div className="space-y-2.5">
            {DEFAULT_READING_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-400">{topic.category}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-300 font-mono">
                      {topic.level}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{topic.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{topic.summaryUz}</p>
                </div>
              );
            })}
          </div>

          {readingList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">From Your Saved Readings:</div>
              {readingList.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    onStartDiscussion(item.title, item.content, ['discussion', 'perspective', 'understanding'])
                  }
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 flex items-center justify-between mb-2 cursor-pointer"
                >
                  <span className="font-medium truncate">{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Article Detail & Discussion Questions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {selectedTopic.category}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{selectedTopic.wordCount} words</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">Level {selectedTopic.level}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{selectedTopic.title}</h3>
            </div>

            {/* Reading Excerpt */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed italic">
              "{selectedTopic.content}"
            </div>

            {/* Active Vocabulary Targets */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Target Vocabulary Challenge (Nutqda ishlatishga harakat qiling):
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.targetVocab.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold"
                  >
                    + {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Teacher's Discussion Questions */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Discussion Questions Prepared by Teacher:
              </div>
              <div className="space-y-2">
                {selectedTopic.discussionQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                onClick={() => handleLaunchDiscussion(selectedTopic)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                Start Discussion with AI Teacher
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
