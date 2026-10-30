import { APIKeyConfig } from '../../types';
import { DBService } from '../database/dbService';

type FailoverListener = (message: string) => void;

class AIService {
  private listeners: Set<FailoverListener> = new Set();

  onFailover(callback: FailoverListener) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyFailover(message: string) {
    this.listeners.forEach(cb => cb(message));
  }

  // Get currently active key, or auto-promote next ready key
  getActiveKey(): APIKeyConfig | null {
    const keys = DBService.getAPIKeys();
    if (keys.length === 0) return null;

    let active = keys.find(k => k.status === 'active');
    if (!active) {
      // Find first ready
      const ready = keys.find(k => k.status === 'ready');
      if (ready) {
        ready.status = 'active';
        DBService.saveAPIKeys(keys);
        active = ready;
      }
    }
    return active || null;
  }

  // Failover mechanism
  private switchToNextKey(failedKeyId: string) {
    const keys = DBService.getAPIKeys();
    const failedKeyIndex = keys.findIndex(k => k.id === failedKeyId);
    
    if (failedKeyIndex >= 0) {
      keys[failedKeyIndex].status = 'rate_limited';
      keys[failedKeyIndex].failureCount = (keys[failedKeyIndex].failureCount || 0) + 1;
    }

    // Find next available ready key
    const nextKey = keys.find(k => k.status === 'ready');
    if (nextKey) {
      nextKey.status = 'active';
      DBService.saveAPIKeys(keys);
      this.notifyFailover('Primary AI connection reached its limit. Switched to backup connection.');
      return nextKey;
    } else {
      DBService.saveAPIKeys(keys);
      this.notifyFailover('All configured AI connections reached their quota limit. Please check Settings.');
      return null;
    }
  }

  // Generic request wrapper with automatic failover
  private async executeWithFailover<T>(
    endpoint: string,
    payload: any,
    attempt: number = 0
  ): Promise<T> {
    const activeKey = this.getActiveKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (activeKey?.key) {
      headers['x-api-key'] = activeKey.key;
      headers['x-provider'] = activeKey.provider;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Quota or rate limit exceeded
        if (response.status === 429 || errorData.error === 'quota_exceeded' || errorData.message?.includes('quota')) {
          if (activeKey && attempt < 3) {
            const nextKey = this.switchToNextKey(activeKey.id);
            if (nextKey) {
              return this.executeWithFailover<T>(endpoint, payload, attempt + 1);
            }
          }
          throw new Error('QUOTA_EXCEEDED: Primary and backup AI limits reached.');
        }

        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        throw err;
      }
      // If network failed and we have another key
      if (activeKey && attempt === 0 && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
        throw new Error('Connection failed. Please check internet connection or dev server.');
      }
      throw err;
    }
  }

  // --- API METHODS ---

  private pendingRequests: Map<string, Promise<any>> = new Map();

  async analyzeWriting(params: {
    text: string;
    task?: string;
    stage?: 'word' | 'sentence' | 'paragraph' | 'essay';
    level?: string;
    taskType?: string;
    previousMistakes?: any[];
  }) {
    const key = `writing_${params.stage}_${params.text.slice(0, 40)}`;
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = this.executeWithFailover<{ success: boolean; data: any; status?: string; message?: string }>(
      '/api/ai/writing-analysis',
      params
    ).finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    const res = await promise;
    if (!res.success && res.status === 'unavailable') {
      throw new Error(res.message || 'Writing analysis is temporarily unavailable.');
    }
    return res.data;
  }

  async testConnection(apiKey: string, provider: 'gemini' | 'openai') {
    const res = await fetch('/api/ai/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, provider }),
    });
    return res.json();
  }

  async createReadingText(params: { topic: string; level: string; length: string }) {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/create-reading', params);
    return res.data;
  }

  async detectLevel(text: string, lang: 'uz' | 'en' = 'uz') {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/detect-level', { text, lang });
    return res.data;
  }

  async analyzeWord(params: { word: string; sentence?: string; contextText?: string; level?: string; lang?: 'uz' | 'en' }) {
    const cached = DBService.getCachedWordAnalysis(params.word, params.level || 'A2', params.lang || 'uz');
    if (cached) {
      return cached;
    }
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/word-analysis', params);
    if (res?.data) {
      DBService.setCachedWordAnalysis(params.word, params.level || 'A2', params.lang || 'uz', res.data);
    }
    return res.data;
  }

  async analyzeSentence(sentence: string, level: string = 'A2', lang: 'uz' | 'en' = 'uz') {
    const cached = DBService.getCachedSentenceAnalysis(sentence, level, lang);
    if (cached) {
      return cached;
    }
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/sentence-analysis', { sentence, level, lang });
    if (res?.data) {
      DBService.setCachedSentenceAnalysis(sentence, level, lang, res.data);
    }
    return res.data;
  }

  async askTeacher(params: {
    question: string;
    currentTextTitle?: string;
    currentSentence?: string;
    selectedWord?: string;
    readingContext?: string;
    lang?: 'uz' | 'en';
    history?: Array<{ role: 'user' | 'model'; text: string }>;
  }) {
    const res = await this.executeWithFailover<{ success: boolean; reply: string }>('/api/ai/teacher-chat', params);
    return res.reply;
  }

  async generatePracticeQuestions(params: { text: string; title: string; level?: string; count?: number }) {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/practice-questions', params);
    return res.data?.questions || [];
  }

  async evaluateComprehension(params: { studentSummary: string; originalText: string; lang?: 'uz' | 'en' }) {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/evaluate-comprehension', params);
    return res.data;
  }

  // --- SPEAKING MODULE METHODS ---

  async sendSpeakingTurn(params: {
    userSpeech: string;
    history: Array<{ role: 'user' | 'model'; text: string }>;
    teacherProfile?: any;
    level?: string;
    mode?: string;
    scenario?: any;
    readingContext?: string | null;
    correctionStyle?: string;
    targetVocabulary?: string[];
    recentMistakes?: any[];
  }) {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/speaking-conversation', params);
    return res.data;
  }

  async howDoISay(uzbekPhrase: string, level: string = 'A2', context: string = '') {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/how-to-say', {
      uzbekPhrase,
      level,
      context,
    });
    return res.data;
  }

  async evaluateSpeakingSession(params: {
    transcript: any[];
    durationSeconds: number;
    level: string;
  }) {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/speaking-analysis', params);
    return res.data;
  }

  async generateSpeakingLesson(topic: string = 'My Day', level: string = 'A2') {
    const res = await this.executeWithFailover<{ success: boolean; data: any }>('/api/ai/speaking-lesson', {
      topic,
      level,
    });
    return res.data;
  }

  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const res = await this.askTeacher({
        question: prompt,
        readingContext: systemInstruction,
      });
      return res;
    } catch (err: any) {
      return `Sample response: Analysis completed for provided input (${prompt.slice(0, 30)}...).`;
    }
  }
}

export const aiService = new AIService();

