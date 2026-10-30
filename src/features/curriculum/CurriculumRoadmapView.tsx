import React, { useState, useEffect } from 'react';
import { LevelMetadata, LessonUnit, CurriculumLevelId } from '../../types/curriculum';
import { CurriculumEngine } from '../../services/curriculum/curriculumEngine';
import { DiagnosticTestModal } from './DiagnosticTestModal';
import { Sparkles, Lock, CheckCircle2, Play, Award, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

interface CurriculumRoadmapViewProps {
  onStartLesson: (lesson: LessonUnit) => void;
}

export const CurriculumRoadmapView: React.FC<CurriculumRoadmapViewProps> = ({ onStartLesson }) => {
  const [levels, setLevels] = useState<LevelMetadata[]>(CurriculumEngine.getLevelMetadataList());
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const activeLesson = CurriculumEngine.getActiveLesson();
  const state = CurriculumEngine.getState();

  const handleDiagnosticComplete = (placedLevelId: CurriculumLevelId) => {
    setLevels(CurriculumEngine.getLevelMetadataList());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 space-y-8">
      {/* Hero Welcome & Diagnostic Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/90 px-3 py-1 rounded-full border border-indigo-800">
                0 dan IELTS 8 gacha O'quv Dasturi
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-800">
                Master Engine Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Ingliz Tili Boshqaruv Markazi
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tizim sizning bilimingizga mos ravishda qadamma-qadam yo'naltiradi. Har bir dars faqat 1 asosiy mavzu, 7 elementli yangi lug'at, 5 ta o'qituvchi qaydi, 3 ta topshiriq va 10 ta uy vazifasidan iborat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowDiagnosticModal(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Darajani Aniqlash Testi</span>
            </button>

            <button
              onClick={() => onStartLesson(activeLesson)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 group"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Bugungi Darsni Boshlash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Lesson Quick Launch Banner */}
      {activeLesson && (
        <div className="bg-slate-900/80 border border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Navbatdagi Rejali Dars
              </span>
              <h3 className="text-base font-bold text-white">{activeLesson.titleUz}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeLesson.targetGoalUz}</p>
            </div>
          </div>

          <button
            onClick={() => onStartLesson(activeLesson)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <span>Darsni Ochish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Level Roadmap Grid (0 -> IELTS 8) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>O'quv Bosqichlari Zanjiri (Master Roadmap)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((lvl) => {
            const lessons = CurriculumEngine.getLessonsForLevel(lvl.id);
            return (
              <div
                key={lvl.id}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                  lvl.unlocked
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white bg-gradient-to-r ${lvl.color}`}>
                      Daraja: {lvl.code}
                    </span>

                    {lvl.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                        Ochiq
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Qulflangan
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{lvl.titleUz}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{lvl.descriptionUz}</p>
                </div>

                {/* Lessons List in Level */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>O'zlashtirish talabi:</span>
                    <span className="font-bold text-indigo-300">{lvl.minMasteryPercentage}%</span>
                  </div>

                  {lessons.map((lsn) => (
                    <button
                      key={lsn.id}
                      disabled={!lvl.unlocked}
                      onClick={() => onStartLesson(lsn)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left text-xs transition-all flex items-center justify-between group"
                    >
                      <div className="truncate max-w-[200px]">
                        <span className="font-mono text-[10px] text-indigo-400 block">
                          Lesson {lsn.lessonNumber}
                        </span>
                        <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                          {lsn.titleUz}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Placement Test Modal */}
      <DiagnosticTestModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        onComplete={handleDiagnosticComplete}
      />
    </div>
  );
};
