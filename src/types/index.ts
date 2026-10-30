export type CEFRLevel = 'Beginner' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type AIProvider = 'gemini' | 'openai';

export type KeyStatus = 'active' | 'ready' | 'rate_limited' | 'disabled';

export interface APIKeyConfig {
  id: string;
  name: string;
  provider: AIProvider;
  key: string;
  status: KeyStatus;
  order: number;
  lastUsed?: number;
  failureCount: number;
}

export interface ReadingSentence {
  id: number;
  text: string;
  start?: number; // For video subtitle timestamps in seconds
  end?: number;
}

export type TextSourceType = 'ai' | 'user' | 'file' | 'video';

export interface ReadingText {
  id: string;
  title: string;
  topic: string;
  level: CEFRLevel;
  content: string;
  sentences: ReadingSentence[];
  sourceType: TextSourceType;
  videoUrl?: string;
  createdAt: number;
  lastReadAt: number;
  progressPercent: number;
  currentSentenceIndex: number;
  notesCount?: number;
  savedWordsCount?: number;
}

export type WordStatus = 'New' | 'Learning' | 'Difficult' | 'Known';

export interface SavedWord {
  id: string;
  word: string;
  phonetic?: string;
  translationUz: string;
  translationEn?: string;
  partOfSpeech?: string;
  simpleMeaning?: string;
  forms?: string;
  examples: string[];
  sourceTextId?: string;
  sourceTextTitle?: string;
  sourceSentence?: string;
  dateAdded: number;
  status: WordStatus;
  reviewCount: number;
}

export interface SavedPhrase {
  id: string;
  phrase: string;
  translation: string;
  meaning: string;
  examples: string[];
  sourceTextId?: string;
  dateAdded: number;
}

export type HighlightType = 'important' | 'unknown' | 'grammar' | 'learn_later' | 'note';

export interface HighlightMarker {
  id: string;
  textId: string;
  sentenceIndex: number;
  word: string;
  type: HighlightType;
  noteText?: string;
  createdAt: number;
}

export interface PracticeQuestion {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface UserProgressData {
  totalReadingMinutes: number;
  todayReadingMinutes: number;
  wordsExplored: number;
  savedWordsCount: number;
  textsCompleted: number;
  currentLevel: CEFRLevel;
  weeklyMinutes: number;
  dailyStreak: number;
  lastActiveDate: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  assistanceLanguage: 'uz' | 'en';
  readingFontFamily: 'sans' | 'serif';
  readingFontSize: number; // 14 to 26 px
  readingLineHeight: number; // 1.5, 1.8, 2.2
  voiceSpeed: number; // 0.5 to 2.0
  voiceGender: 'female' | 'male';
  voiceAccent: 'en-US' | 'en-GB';
  vrmModelUrl: string | null;
  vrmModelName?: string;
  enableLipSync: boolean;
  enableBreathing: boolean;
  focusMode: boolean;
  teacherVoice?: string;
}

// ==========================================
// PHASE 2: SPEAKING & GLOBAL TEACHER TYPES
// ==========================================

export type TeacherPersonality = 'Friendly' | 'Calm' | 'Professional' | 'Energetic' | 'Patient';
export type CorrectionStyle = 'Gentle' | 'Balanced' | 'Strict';

export interface TeacherProfile {
  id: string;
  name: string;
  vrmModelUrl: string | null;
  vrmModelName?: string;
  avatarStyle: 'stylized_humanoid' | 'custom_vrm';
  personality: TeacherPersonality;
  correctionStyle: CorrectionStyle;
  speakingSpeed: number; // 0.5 - 2.0
  preferredUzbekVoiceId: string;
  preferredEnglishVoiceId: string;
  supportLanguage: 'uz' | 'en' | 'auto';
  animationEnabled: boolean;
  lipSyncEnabled: boolean;
  emotionEnabled: boolean;
}

export interface TeacherVoice {
  id: string;
  provider: 'uzbek_natural' | 'system' | 'azure_compatible';
  displayName: string;
  region: string;
  gender: 'female' | 'male';
  languages: string[];
  locale: string;
  nativeUzbek: boolean;
  supportsEnglish: boolean;
  supportsSpeed: boolean;
  quality: 'ultra_hd' | 'natural' | 'standard';
  descriptionUz: string;
  samplePhraseUz: string;
  samplePhraseEn: string;
  isFavorite?: boolean;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'teacher';
  text: string;
  audioDurationSeconds?: number;
  timestamp: number;
  emotion?: 'neutral' | 'happy' | 'encouraging' | 'thinking' | 'surprised';
  correction?: {
    hasCorrection: boolean;
    userOriginal?: string;
    corrected?: string;
    moreNatural?: string;
    explanationUz?: string;
  };
  hints?: {
    keyword?: string;
    sentenceStart?: string;
    fullExample?: string;
  };
  fluencyFlags?: string[];
}

export interface SpeakingSession {
  id: string;
  date: number;
  mode: 'talk' | 'lesson' | 'roleplay' | 'pronunciation' | 'shadowing' | 'read_and_talk' | 'challenge';
  topic: string;
  level: CEFRLevel;
  durationSeconds: number;
  userTalkingSeconds: number;
  teacherTalkingSeconds: number;
  turns: ConversationTurn[];
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  correctionsCount: number;
  fillerWordsCount: Record<string, number>;
  keyTakeaway: string;
  completed: boolean;
}

export interface MistakeMemoryItem {
  id: string;
  category: string;
  original: string;
  corrected: string;
  moreNatural?: string;
  explanationUz: string;
  date: number;
  contextSentence?: string;
  frequency: number;
  lastPracticed?: number;
  mastered: boolean;
}

export interface RolePlayScenario {
  id: string;
  category: string;
  title: string;
  situation: string;
  userRole: string;
  teacherRole: string;
  goal: string;
  difficulty: 'Easy' | 'Normal' | 'Realistic';
  usefulPhrases: string[];
  starterPrompt: string;
}

export interface SpeakingLesson {
  id: string;
  title: string;
  topic: string;
  level: CEFRLevel;
  targetGrammar: string;
  targetPhrases: Array<{
    phrase: string;
    translationUz: string;
    phonetic: string;
    usageNote: string;
  }>;
  practiceTasks: Array<{
    prompt: string;
    expectedStructure: string;
    sampleAnswer: string;
  }>;
  applyStarter: string;
}

export interface SpeakingProgressData {
  totalMinutesSpoken: number;
  todayMinutesSpoken: number;
  weeklyMinutesSpoken: number;
  streakDays: number;
  sessionsCount: number;
  wordsSpoken: number;
  averageFluencyScore: number;
  activeVocabularyCount: number;
}
