/**
 * Master Curriculum Data Types (Level 0 -> IELTS 8)
 */

export type CurriculumLevelId = 
  | 'LEVEL_0' 
  | 'LEVEL_A1' 
  | 'LEVEL_A2' 
  | 'LEVEL_B1' 
  | 'LEVEL_B2' 
  | 'LEVEL_C1' 
  | 'LEVEL_IELTS_6' 
  | 'LEVEL_IELTS_7' 
  | 'LEVEL_IELTS_7_5' 
  | 'LEVEL_IELTS_8';

export interface SevenElementVocab {
  id: string;
  word: string;
  phonetic: string;
  translationUz: string;
  partOfSpeech: string; // 'Ot' | 'Fe\'l' | 'Sifat' | 'Ravish' | 'Bog'lovchi' etc.
  simpleExampleEn: string;
  simpleExampleUz: string;
  commonCollocation: string;
  forms: string; // e.g., "study - studied - studying"
  audioUrl?: string;
}

export interface TeacherNotes {
  teacherTipUz: string;     // 💡 O'qituvchi maslahati
  commonMistakeUz: string;  // ⚠️ Ko'p qilinadigan xato
  keyRuleUz: string;        // 🗝️ Asosiy kalit qoida
  rememberUz: string;       // 📌 Yodda tuting
  whyUz: string;            // ❓ Nima uchun shunday?
}

export interface GrammarLesson {
  title: string;
  structurePattern: string; // e.g. "Subject + am/is/are + Complement"
  explanationUz: string;
  teacherNotes: TeacherNotes;
  keyWordExamples: Array<{
    en: string;
    uz: string;
    keyWordHighlighted: string;
  }>;
}

export interface ReviewQuestion {
  id: string;
  questionUz: string;
  promptEn: string;
  options: string[];
  correctOptionIndex: number;
  socraticExplanationUz: string;
  ruleUz: string;
  correctModelEn: string;
  followUpQuestion: {
    questionUz: string;
    promptEn: string;
    options: string[];
    correctOptionIndex: number;
  };
}

export interface CoreTask {
  id: string;
  type: 'understand' | 'use' | 'produce'; // Task 1, Task 2, Task 3
  titleUz: string;
  instructionsUz: string;
  promptEn: string;
  questionType: 'multiple_choice' | 'fill_gap' | 'sentence_order' | 'free_speak_write';
  options?: string[];
  correctAnswer: string;
  hintsUz?: string[];
  socraticFeedback: {
    ruleUz: string;
    explanationUz: string;
    modelExampleEn: string;
  };
}

export type HomeworkSkillType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'mixed_challenge';

export interface HomeworkItem {
  id: string;
  itemNumber: number; // 1 to 10
  skillType: HomeworkSkillType;
  titleUz: string;
  promptEn: string;
  questionType: 'mcq' | 'gap_fill' | 'reorder' | 'speak' | 'write';
  options?: string[];
  correctAnswer: string;
  audioPromptText?: string;
  socraticFeedbackUz: {
    explanation: string;
    rule: string;
    correctModel: string;
  };
}

export interface LessonUnit {
  id: string;
  levelId: CurriculumLevelId;
  unitNumber: number;
  lessonNumber: number;
  titleUz: string;
  titleEn: string;
  targetGoalUz: string; // "Bugungi darsdan keyin siz..."
  estimatedMinutes: number;
  reviewQuestions: ReviewQuestion[];
  vocabulary: SevenElementVocab[];
  grammar: GrammarLesson;
  coreTasks: CoreTask[]; // Task 1, 2, 3
  homeworkItems: HomeworkItem[]; // 10 items
  requiredPassPercentage: number; // e.g. 85% for L0-A2, 80% for B1-B2
}

export interface LevelMetadata {
  id: CurriculumLevelId;
  code: string; // "0", "A1", "A2", "B1", "B2", "C1", "IELTS 6", "IELTS 7", "IELTS 7.5", "IELTS 8"
  titleUz: string;
  descriptionUz: string;
  minMasteryPercentage: number;
  unlocked: boolean;
  totalLessons: number;
  completedLessons: number;
  color: string;
}

export interface CurriculumProgressState {
  currentLevelId: CurriculumLevelId;
  completedLessonIds: string[];
  lessonScores: Record<string, number>; // lessonId -> percentage
  activeLessonId: string;
  diagnosticCompleted: boolean;
  diagnosticResultLevel?: CurriculumLevelId;
  lastUpdated: number;
}
