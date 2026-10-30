import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  Clock,
  Award,
  Filter,
  Volume2,
  Trash2,
  Check,
  ChevronRight,
  BarChart2,
} from 'lucide-react';
import { MistakeMemoryItem, SpeakingSession } from '../../types';
import { DBService } from '../../services/database/dbService';
import { ttsService } from '../../services/tts/ttsService';
import { SpeakingReportModal } from './SpeakingReportModal';

export const ReviewTab: React.FC = () => {
  const [mistakes, setMistakes] = useState<MistakeMemoryItem[]>([]);
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showMastered, setShowMastered] = useState<boolean>(true);
  const [activeReportSession, setActiveReportSession] = useState<SpeakingSession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    let savedMistakes = DBService.getMistakeMemory();
    // If empty, provide a few default pedagogical mistakes
    if (savedMistakes.length === 0) {
      savedMistakes = [
        {
          id: 'mistake-1',
          category: 'Grammar',
          original: 'I am agree with your opinion.',
          corrected: 'I agree with your opinion.',
          moreNatural: 'I completely share your viewpoint.',
          explanationUz: "'Agree' — bu sifat emas, balki mustaqil feʼldir. Shuning uchun 'am' yordamchi feʼli qoʻshilmaydi.",
          date: Date.now() - 3600000 * 24,
          frequency: 3,
          mastered: false,
        },
        {
          id: 'mistake-2',
          category: 'Prepositions',
          original: 'She arrived to the airport late.',
          corrected: 'She arrived at the airport late.',
          moreNatural: 'She reached the airport behind schedule.',
          explanationUz: "Bino yoki aniq manzilga yetib borishda 'arrive at' ishlatiladi ('arrive to' emas).",
          date: Date.now() - 3600000 * 48,
          frequency: 2,
          mastered: false,
        },
        {
          id: 'mistake-3',
          category: 'Word Choice',
          original: 'I made a photo yesterday.',
          corrected: 'I took a photo yesterday.',
          moreNatural: 'I captured some great shots yesterday.',
          explanationUz: "Ingliz tilida rasmga tushish yoki rasmga olish uchun 'make' emas, 'take a photo' birikmasi qoʻllanadi.",
          date: Date.now() - 3600000 * 72,
          frequency: 1,
          mastered: true,
        },
      ];
      savedMistakes.forEach((m) => DBService.addMistakeMemory(m));
    }
    setMistakes(savedMistakes);
    setSessions(DBService.getSpeakingSessions());
  };

  const handleToggleMastered = (id: string, current: boolean) => {
    DBService.markMistakeMastered(id, !current);
    loadData();
  };

  const handlePlayAudio = (text: string) => {
    ttsService.speak(text);
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (!showMastered && m.mastered) return false;
    if (filterCategory !== 'all' && m.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Personal Mistake Vault
            </span>
            <span className="text-xs text-slate-400">Repeated Error Tracking & Memory</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Review & Mistake Bank</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Suhbatlar davomida qayd etilgan xatolarni takrorlang va oʻzlashtirilgan deb belgilang
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500"
          >
            <option value="all">All Categories</option>
            <option value="grammar">Grammar</option>
            <option value="prepositions">Prepositions</option>
            <option value="word choice">Word Choice</option>
          </select>

          <button
            onClick={() => setShowMastered(!showMastered)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              showMastered
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {showMastered ? 'Showing All' : 'Hide Mastered'}
          </button>
        </div>
      </div>

      {/* Mistake Cards Grid */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Active Mistakes ({filteredMistakes.length})
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Qoyil! Hozircha bu boʻlimda xatolar yoʻq. Yangi suhbatlarni boshlang!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMistakes.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  item.mastered
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.frequency > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          Made {item.frequency}x
                        </span>
                      )}
                      {item.mastered && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          ✓ Mastered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Original vs Correct */}
                  <div className="space-y-2 text-sm">
                    <div className="bg-rose-950/30 border border-rose-900/40 p-2.5 rounded-xl text-rose-300 flex items-start gap-2">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span className="line-through">{item.original}</span>
                    </div>

                    <div className="bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-xl text-emerald-300 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className="font-semibold">{item.corrected}</span>
                      </div>
                      <button
                        onClick={() => handlePlayAudio(item.corrected)}
                        className="p-1 text-emerald-400 hover:text-emerald-200 transition cursor-pointer"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.moreNatural && (
                      <div className="bg-slate-950 p-2 rounded-xl text-xs text-slate-300 flex items-start gap-2 border border-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-amber-400">Natural alternative:</strong> "{item.moreNatural}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Uzbek Note */}
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    🇺🇿 {item.explanationUz}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handlePlayAudio(item.corrected)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Pronounce Correct
                  </button>

                  <button
                    onClick={() => handleToggleMastered(item.id, item.mastered)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      item.mastered
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {item.mastered ? 'Unmark Mastered' : 'Mark as Mastered'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Speaking Sessions History */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Recent Speaking Sessions ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            Hozircha saqlangan suhbatlar mavjud emas. Suhbat tugagach hisobot shu yerda saqlanadi.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => setActiveReportSession(sess)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-100">{sess.topic}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {sess.mode}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(sess.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    Key takeaway: {sess.keyTakeaway || 'Consistent practice builds fluency'}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">{sess.overallScore}%</div>
                    <div className="text-[10px] text-slate-500">Overall</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reopen Session Report Modal */}
      {activeReportSession && (
        <SpeakingReportModal
          isOpen={true}
          sessionData={activeReportSession}
          onClose={() => setActiveReportSession(null)}
          onPracticeCorrection={() => setActiveReportSession(null)}
        />
      )}
    </div>
  );
};
