import {
  APIKeyConfig,
  AppSettings,
  HighlightMarker,
  ReadingText,
  SavedWord,
  SavedPhrase,
  UserProgressData,
  SpeakingSession,
  MistakeMemoryItem,
  SpeakingProgressData,
} from '../../types';

const STORAGE_KEYS = {
  API_KEYS: 'eng_teacher_api_keys_v1',
  SETTINGS: 'eng_teacher_settings_v1',
  TEXTS: 'eng_teacher_texts_v1',
  ACTIVE_TEXT_ID: 'eng_teacher_active_text_id_v1',
  SAVED_WORDS: 'eng_teacher_saved_words_v1',
  SAVED_PHRASES: 'eng_teacher_saved_phrases_v1',
  HIGHLIGHTS: 'eng_teacher_highlights_v1',
  PROGRESS: 'eng_teacher_progress_v1',
  HAS_ONBOARDED: 'eng_teacher_onboarded_v1',
  SPEAKING_SESSIONS: 'eng_teacher_speaking_sessions_v1',
  MISTAKE_MEMORY: 'eng_teacher_mistake_memory_v1',
  SPEAKING_PROGRESS: 'eng_teacher_speaking_progress_v1',
};

// Initial Sample Texts so app is immediately usable out-of-the-box
const INITIAL_TEXTS: ReadingText[] = [
  {
    id: 'sample-tech-a2',
    title: 'How Artificial Intelligence Helps Us Learn',
    topic: 'Technology',
    level: 'A2',
    sourceType: 'ai',
    createdAt: Date.now() - 3600000 * 24,
    lastReadAt: Date.now() - 3600000 * 2,
    progressPercent: 45,
    currentSentenceIndex: 2,
    content: `Artificial intelligence is changing the way students study languages around the world. Today, software can listen to your pronunciation and give immediate feedback. It also adapts to your personal learning speed. When you do not understand a difficult word, your AI teacher can explain it in your native language. With daily practice, you can build confidence and improve your speaking and reading abilities. Education is becoming more accessible for everyone.`,
    sentences: [
      { id: 0, text: 'Artificial intelligence is changing the way students study languages around the world.' },
      { id: 1, text: 'Today, software can listen to your pronunciation and give immediate feedback.' },
      { id: 2, text: 'It also adapts to your personal learning speed.' },
      { id: 3, text: 'When you do not understand a difficult word, your AI teacher can explain it in your native language.' },
      { id: 4, text: 'With daily practice, you can build confidence and improve your speaking and reading abilities.' },
      { id: 5, text: 'Education is becoming more accessible for everyone.' }
    ]
  },
  {
    id: 'sample-daily-b1',
    title: 'The Art of Mindful Morning Routines',
    topic: 'Daily Life',
    level: 'B1',
    sourceType: 'ai',
    createdAt: Date.now() - 3600000 * 48,
    lastReadAt: Date.now() - 3600000 * 12,
    progressPercent: 100,
    currentSentenceIndex: 5,
    content: `Many successful individuals believe that the first hour of the day determines your overall productivity. Instead of immediately checking notifications or emails, taking a few quiet moments to drink water and read can clear your mind. Research suggests that gentle morning physical activity enhances cognitive focus and reduces stress levels throughout the afternoon. Developing a consistent morning ritual requires patience and discipline, but the long-term benefits are truly substantial.`,
    sentences: [
      { id: 0, text: 'Many successful individuals believe that the first hour of the day determines your overall productivity.' },
      { id: 1, text: 'Instead of immediately checking notifications or emails, taking a few quiet moments to drink water and read can clear your mind.' },
      { id: 2, text: 'Research suggests that gentle morning physical activity enhances cognitive focus and reduces stress levels throughout the afternoon.' },
      { id: 3, text: 'Developing a consistent morning ritual requires patience and discipline, but the long-term benefits are truly substantial.' }
    ]
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  assistanceLanguage: 'uz',
  readingFontFamily: 'sans',
  readingFontSize: 18,
  readingLineHeight: 1.8,
  voiceSpeed: 1.0,
  voiceGender: 'female',
  voiceAccent: 'en-US',
  vrmModelUrl: null,
  enableLipSync: true,
  enableBreathing: true,
  focusMode: false,
};

const DEFAULT_PROGRESS: UserProgressData = {
  totalReadingMinutes: 48,
  todayReadingMinutes: 18,
  wordsExplored: 24,
  savedWordsCount: 7,
  textsCompleted: 3,
  currentLevel: 'A2',
  weeklyMinutes: 112,
  dailyStreak: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

const INITIAL_SAVED_WORDS: SavedWord[] = [
  {
    id: 'word-1',
    word: 'develop',
    phonetic: '/dɪˈvel.əp/',
    translationUz: 'rivojlantirmoq, o\'smoq',
    partOfSpeech: 'verb',
    simpleMeaning: 'to make something grow or become better',
    forms: 'develop, developed, developed, developing',
    examples: [
      'I want to develop my English skills quickly.',
      'She develops modern computer applications.',
      'This technology is developing every single day.'
    ],
    dateAdded: Date.now() - 86400000,
    status: 'Learning',
    reviewCount: 3,
  },
  {
    id: 'word-2',
    word: 'although',
    phonetic: '/ɔːlˈðəʊ/',
    translationUz: 'bo\'lsa ham, garchi',
    partOfSpeech: 'conjunction',
    simpleMeaning: 'used for introducing a statement that makes the main statement surprising',
    forms: 'invariable',
    examples: [
      'Although it was raining, he walked to school.',
      'She succeeded although the task was hard.',
      'Although he is young, he speaks fluent English.'
    ],
    dateAdded: Date.now() - 43200000,
    status: 'Difficult',
    reviewCount: 2,
  }
];

export class DBService {
  // Simple obfuscation/hashing for desktop local storage
  private static obfuscate(text: string): string {
    try {
      return btoa(encodeURIComponent(text));
    } catch {
      return text;
    }
  }

  private static deobfuscate(encoded: string): string {
    try {
      return decodeURIComponent(atob(encoded));
    } catch {
      return encoded;
    }
  }

  // --- API KEYS ---
  static getAPIKeys(): APIKeyConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      if (!data) return [];
      const keys: APIKeyConfig[] = JSON.parse(data);
      return keys.map(k => ({
        ...k,
        key: this.deobfuscate(k.key),
      }));
    } catch {
      return [];
    }
  }

  static saveAPIKeys(keys: APIKeyConfig[]): void {
    const serialized = keys.map(k => ({
      ...k,
      key: this.obfuscate(k.key),
    }));
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(serialized));
  }

  static addAPIKey(key: string, provider: 'gemini' | 'openai' = 'gemini', name?: string): APIKeyConfig[] {
    const current = this.getAPIKeys();
    if (current.length >= 10) {
      throw new Error('Maximum 10 API keys reached');
    }
    const newEntry: APIKeyConfig = {
      id: 'key_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name || `API Key ${current.length + 1}`,
      provider,
      key,
      status: current.length === 0 ? 'active' : 'ready',
      order: current.length,
      failureCount: 0,
      lastUsed: Date.now(),
    };
    const updated = [...current, newEntry];
    this.saveAPIKeys(updated);
    return updated;
  }

  // --- SETTINGS ---
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- ONBOARDING STATUS ---
  static hasOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED) === 'true';
  }

  static setOnboarded(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, String(val));
  }

  // --- READING TEXTS ---
  static getReadingTexts(): ReadingText[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEXTS);
      if (!data) {
        this.saveReadingTexts(INITIAL_TEXTS);
        return INITIAL_TEXTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TEXTS;
    }
  }

  static saveReadingTexts(texts: ReadingText[]): void {
    localStorage.setItem(STORAGE_KEYS.TEXTS, JSON.stringify(texts));
  }

  static saveText(text: ReadingText): void {
    const texts = this.getReadingTexts();
    const idx = texts.findIndex(t => t.id === text.id);
    if (idx >= 0) {
      texts[idx] = text;
    } else {
      texts.unshift(text);
    }
    this.saveReadingTexts(texts);
  }

  static getActiveTextId(): string | null {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEXT_ID);
    if (id) return id;
    const texts = this.getReadingTexts();
    return texts[0]?.id || null;
  }

  static setActiveTextId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TEXT_ID, id);
  }

  // --- SAVED WORDS ---
  static getSavedWords(): SavedWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_WORDS);
      if (!data) {
        this.saveWords(INITIAL_SAVED_WORDS);
        return INITIAL_SAVED_WORDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAVED_WORDS;
    }
  }

  static saveWords(words: SavedWord[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_WORDS, JSON.stringify(words));
  }

  static addWord(word: Omit<SavedWord, 'id' | 'dateAdded' | 'reviewCount'>): SavedWord {
    const words = this.getSavedWords();
    const existingIdx = words.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase());
    
    if (existingIdx >= 0) {
      words[existingIdx] = {
        ...words[existingIdx],
        ...word,
        reviewCount: words[existingIdx].reviewCount + 1,
      };
      this.saveWords(words);
      return words[existingIdx];
    }

    const newWord: SavedWord = {
      ...word,
      id: 'word_' + Date.now(),
      dateAdded: Date.now(),
      reviewCount: 1,
    };
    words.unshift(newWord);
    this.saveWords(words);

    // Update progress
    this.incrementSavedWordsCount();

    return newWord;
  }

  static updateWordStatus(id: string, status: SavedWord['status']): void {
    const words = this.getSavedWords();
    const idx = words.findIndex(w => w.id === id);
    if (idx >= 0) {
      words[idx].status = status;
      this.saveWords(words);
    }
  }

  static deleteWord(id: string): void {
    const words = this.getSavedWords().filter(w => w.id !== id);
    this.saveWords(words);
  }

  // --- SAVED PHRASES ---
  static getSavedPhrases(): SavedPhrase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PHRASES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addPhrase(phrase: Omit<SavedPhrase, 'id' | 'dateAdded'>): SavedPhrase {
    const phrases = this.getSavedPhrases();
    const newPhrase: SavedPhrase = {
      ...phrase,
      id: 'phrase_' + Date.now(),
      dateAdded: Date.now(),
    };
    phrases.unshift(newPhrase);
    localStorage.setItem(STORAGE_KEYS.SAVED_PHRASES, JSON.stringify(phrases));
    return newPhrase;
  }

  // --- HIGHLIGHTS & NOTES ---
  static getHighlights(textId?: string): HighlightMarker[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      const items: HighlightMarker[] = data ? JSON.parse(data) : [];
      if (textId) {
        return items.filter(h => h.textId === textId);
      }
      return items;
    } catch {
      return [];
    }
  }

  static addHighlight(highlight: Omit<HighlightMarker, 'id' | 'createdAt'>): HighlightMarker {
    const all = this.getHighlights();
    const newHighlight: HighlightMarker = {
      ...highlight,
      id: 'hl_' + Date.now(),
      createdAt: Date.now(),
    };
    all.push(newHighlight);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
    return newHighlight;
  }

  static removeHighlight(id: string): void {
    const all = this.getHighlights().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
  }

  // --- PROGRESS ---
  static getProgress(): UserProgressData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return DEFAULT_PROGRESS;
      return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PROGRESS;
    }
  }

  static saveProgress(progress: Partial<UserProgressData>): UserProgressData {
    const current = this.getProgress();
    const updated = { ...current, ...progress };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
    return updated;
  }

  static addReadingMinutes(minutes: number): void {
    const prog = this.getProgress();
    prog.todayReadingMinutes += minutes;
    prog.totalReadingMinutes += minutes;
    prog.weeklyMinutes += minutes;
    this.saveProgress(prog);
  }

  static incrementWordsExplored(): void {
    const prog = this.getProgress();
    prog.wordsExplored += 1;
    this.saveProgress(prog);
  }

  static incrementSavedWordsCount(): void {
    const prog = this.getProgress();
    prog.savedWordsCount = this.getSavedWords().length;
    this.saveProgress(prog);
  }

  // --- SPEAKING SESSIONS ---
  static getSpeakingSessions(): SpeakingSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPEAKING_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSpeakingSession(session: SpeakingSession): void {
    const sessions = this.getSpeakingSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SPEAKING_SESSIONS, JSON.stringify(sessions));

    // Update speaking progress
    const mins = Math.max(1, Math.round(session.durationSeconds / 60));
    this.addSpeakingMinutes(mins);
  }

  // --- MISTAKE MEMORY ---
  static getMistakeMemory(): MistakeMemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKE_MEMORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addMistakeMemory(mistake: Omit<MistakeMemoryItem, 'id' | 'frequency' | 'mastered'>): void {
    const list = this.getMistakeMemory();
    const existing = list.find(
      (m) => m.original.toLowerCase().trim() === mistake.original.toLowerCase().trim()
    );
    if (existing) {
      existing.frequency += 1;
      existing.lastPracticed = Date.now();
      existing.corrected = mistake.corrected;
    } else {
      list.unshift({
        ...mistake,
        id: 'mistake_' + Date.now(),
        frequency: 1,
        mastered: false,
      });
    }
    localStorage.setItem(STORAGE_KEYS.MISTAKE_MEMORY, JSON.stringify(list));
  }

  static markMistakeMastered(id: string, mastered = true): void {
    const list = this.getMistakeMemory();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.mastered = mastered;
      localStorage.setItem(STORAGE_KEYS.MISTAKE_MEMORY, JSON.stringify(list));
    }
  }

  // --- SPEAKING PROGRESS ---
  static getSpeakingProgress(): SpeakingProgressData {
    const defaultData: SpeakingProgressData = {
      totalMinutesSpoken: 72,
      todayMinutesSpoken: 12,
      weeklyMinutesSpoken: 72,
      streakDays: 6,
      sessionsCount: 5,
      wordsSpoken: 540,
      averageFluencyScore: 84,
      activeVocabularyCount: 18,
    };
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPEAKING_PROGRESS);
      return data ? { ...defaultData, ...JSON.parse(data) } : defaultData;
    } catch {
      return defaultData;
    }
  }

  static saveSpeakingProgress(prog: Partial<SpeakingProgressData>): SpeakingProgressData {
    const current = this.getSpeakingProgress();
    const updated = { ...current, ...prog };
    localStorage.setItem(STORAGE_KEYS.SPEAKING_PROGRESS, JSON.stringify(updated));
    return updated;
  }

  static addSpeakingMinutes(mins: number): void {
    const prog = this.getSpeakingProgress();
    prog.todayMinutesSpoken += mins;
    prog.totalMinutesSpoken += mins;
    prog.weeklyMinutesSpoken += mins;
    this.saveSpeakingProgress(prog);
  }

  // --- LOCAL CACHING LAYER FOR ANALYSIS (PERFORMANCE OPTIMIZATION) ---
  static getCachedWordAnalysis(word: string, level = 'A2', lang = 'uz'): any | null {
    try {
      const key = `word_cache_${word.toLowerCase().trim()}_${level}_${lang}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setCachedWordAnalysis(word: string, level = 'A2', lang = 'uz', analysisData: any): void {
    try {
      const key = `word_cache_${word.toLowerCase().trim()}_${level}_${lang}`;
      localStorage.setItem(key, JSON.stringify(analysisData));
    } catch {
      // Ignore cache write error
    }
  }

  static getCachedSentenceAnalysis(sentence: string, level = 'A2', lang = 'uz'): any | null {
    try {
      const key = `sent_cache_${sentence.toLowerCase().trim().slice(0, 50)}_${level}_${lang}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setCachedSentenceAnalysis(sentence: string, level = 'A2', lang = 'uz', analysisData: any): void {
    try {
      const key = `sent_cache_${sentence.toLowerCase().trim().slice(0, 50)}_${level}_${lang}`;
      localStorage.setItem(key, JSON.stringify(analysisData));
    } catch {
      // Ignore cache write error
    }
  }
}
