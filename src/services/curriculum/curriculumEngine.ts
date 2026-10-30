import { CurriculumLevelId, CurriculumProgressState, LessonUnit, LevelMetadata } from '../../types/curriculum';
import { LEVEL_METADATA_LIST, MASTER_LESSONS, DIAGNOSTIC_QUESTIONS } from './curriculumData';

const CURRICULUM_STORAGE_KEY = 'english_ai_curriculum_progress_v1';

export class CurriculumEngine {
  private static state: CurriculumProgressState = CurriculumEngine.loadState();

  public static loadState(): CurriculumProgressState {
    try {
      const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return {
      currentLevelId: 'LEVEL_0',
      completedLessonIds: [],
      lessonScores: {},
      activeLessonId: 'L0_U1_L1',
      diagnosticCompleted: false,
      lastUpdated: Date.now(),
    };
  }

  public static saveState(updated: Partial<CurriculumProgressState>): CurriculumProgressState {
    this.state = {
      ...this.state,
      ...updated,
      lastUpdated: Date.now(),
    };
    try {
      localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
    return this.state;
  }

  public static getState(): CurriculumProgressState {
    return this.state;
  }

  public static getLevelMetadataList(): LevelMetadata[] {
    const completedSet = new Set(this.state.completedLessonIds);
    return LEVEL_METADATA_LIST.map((meta, index) => {
      // Level 0 is always unlocked.
      // Other levels unlock if previous level is completed or placed via diagnostic test.
      let unlocked = index === 0;
      if (this.state.diagnosticCompleted && this.state.currentLevelId === meta.id) {
        unlocked = true;
      } else if (index > 0) {
        const prevLevelId = LEVEL_METADATA_LIST[index - 1].id;
        const prevLessons = MASTER_LESSONS.filter((l) => l.levelId === prevLevelId);
        const prevCompleted = prevLessons.filter((l) => completedSet.has(l.id));
        if (prevLessons.length > 0 && prevCompleted.length >= prevLessons.length) {
          unlocked = true;
        } else if (this.getLevelIndex(meta.id) <= this.getLevelIndex(this.state.currentLevelId)) {
          unlocked = true;
        }
      }

      const levelLessons = MASTER_LESSONS.filter((l) => l.levelId === meta.id);
      const levelCompleted = levelLessons.filter((l) => completedSet.has(l.id)).length;

      return {
        ...meta,
        unlocked,
        totalLessons: Math.max(meta.totalLessons, levelLessons.length),
        completedLessons: levelCompleted,
      };
    });
  }

  private static getLevelIndex(levelId: CurriculumLevelId): number {
    return LEVEL_METADATA_LIST.findIndex((l) => l.id === levelId);
  }

  public static getActiveLesson(): LessonUnit {
    const found = MASTER_LESSONS.find((l) => l.id === this.state.activeLessonId);
    if (found) return found;
    return MASTER_LESSONS[0];
  }

  public static getLessonsForLevel(levelId: CurriculumLevelId): LessonUnit[] {
    return MASTER_LESSONS.filter((l) => l.levelId === levelId);
  }

  public static submitLessonScore(lessonId: string, percentageScore: number): {
    passed: boolean;
    requiredScore: number;
    unlockedNext: boolean;
    messageUz: string;
  } {
    const lesson = MASTER_LESSONS.find((l) => l.id === lessonId);
    const required = lesson?.requiredPassPercentage || 85;
    const passed = percentageScore >= required;

    const newScores = { ...this.state.lessonScores, [lessonId]: percentageScore };
    const completed = new Set(this.state.completedLessonIds);

    let unlockedNext = false;
    let messageUz = '';

    if (passed) {
      completed.add(lessonId);
      messageUz = `Ajoyib! Siz ${percentageScore}% natija bilan darsni muvaffaqiyatli topshirdingiz.`;

      // Find next lesson
      const currentIdx = MASTER_LESSONS.findIndex((l) => l.id === lessonId);
      if (currentIdx !== -1 && currentIdx + 1 < MASTER_LESSONS.length) {
        const nextLesson = MASTER_LESSONS[currentIdx + 1];
        this.saveState({
          completedLessonIds: Array.from(completed),
          lessonScores: newScores,
          activeLessonId: nextLesson.id,
          currentLevelId: nextLesson.levelId,
        });
        unlockedNext = true;
      } else {
        this.saveState({
          completedLessonIds: Array.from(completed),
          lessonScores: newScores,
        });
      }
    } else {
      messageUz = `Darsni yakunlash uchun ${required}% ball kerak (sizniki: ${percentageScore}%). Takrorlash tavsiya etiladi.`;
      this.saveState({ lessonScores: newScores });
    }

    return {
      passed,
      requiredScore: required,
      unlockedNext,
      messageUz,
    };
  }

  public static setPlacementResult(levelId: CurriculumLevelId) {
    const firstLessonOfLevel = MASTER_LESSONS.find((l) => l.levelId === levelId) || MASTER_LESSONS[0];
    this.saveState({
      currentLevelId: levelId,
      activeLessonId: firstLessonOfLevel.id,
      diagnosticCompleted: true,
    });
  }

  public static generateSocraticExplanation(userAnswer: string, correctAnswer: string, ruleUz: string): {
    titleUz: string;
    explanationUz: string;
    ruleUz: string;
    correctModel: string;
  } {
    return {
      titleUz: '⚠️ Xatolik ustida ishlash (Sokratik Tushuntirish)',
      explanationUz: `Siz "${userAnswer}" variantini tanladingiz. Lekin to'g'ri variant "${correctAnswer}". Bunga sabab:`,
      ruleUz: ruleUz || 'Ingliz tilida grammatik qoidalarga qat\'iy amal qilish talab etiladi.',
      correctModel: correctAnswer,
    };
  }
}
