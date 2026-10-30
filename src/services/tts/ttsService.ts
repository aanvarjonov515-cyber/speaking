type SpeechCallback = () => void;
type WordBoundaryCallback = (charIndex: number, length: number) => void;

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal: boolean = false;
  private isPausedInternal: boolean = false;
  private boundaryListeners: Set<WordBoundaryCallback> = new Set();
  private startListeners: Set<SpeechCallback> = new Set();
  private endListeners: Set<SpeechCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return !!this.synth;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
  }

  onWordBoundary(cb: WordBoundaryCallback) {
    this.boundaryListeners.add(cb);
    return () => this.boundaryListeners.delete(cb);
  }

  onStart(cb: SpeechCallback) {
    this.startListeners.add(cb);
    return () => this.startListeners.delete(cb);
  }

  onEnd(cb: SpeechCallback) {
    this.endListeners.add(cb);
    return () => this.endListeners.delete(cb);
  }

  speak(text: string, options: {
    rate?: number;
    pitch?: number;
    lang?: string;
    voiceName?: string;
    onEnd?: () => void;
    onStart?: () => void;
  } = {}) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this environment');
      options.onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.lang = options.lang ?? 'en-US';

    // Pick best English voice if specified or natural match
    const voices = this.getVoices();
    if (options.voiceName) {
      const found = voices.find(v => v.name === options.voiceName);
      if (found) utterance.voice = found;
    } else {
      // Prefer high quality English voices (Google US English, Samantha, Daniel, Natural)
      const preferred = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) &&
        (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
      );
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => {
      this.isSpeakingInternal = true;
      this.isPausedInternal = false;
      options.onStart?.();
      this.startListeners.forEach(cb => cb());
    };

    utterance.onend = () => {
      this.isSpeakingInternal = false;
      this.isPausedInternal = false;
      this.currentUtterance = null;
      options.onEnd?.();
      this.endListeners.forEach(cb => cb());
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      this.isSpeakingInternal = false;
      this.isPausedInternal = false;
      this.currentUtterance = null;
      options.onEnd?.();
      this.endListeners.forEach(cb => cb());
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const charLength = event.charLength || 4;
        this.boundaryListeners.forEach(cb => cb(charIndex, charLength));
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isSpeakingInternal && !this.isPausedInternal) {
      this.synth.pause();
      this.isPausedInternal = true;
    }
  }

  resume() {
    if (this.synth && this.isPausedInternal) {
      this.synth.resume();
      this.isPausedInternal = false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingInternal = false;
      this.isPausedInternal = false;
      this.currentUtterance = null;
      this.endListeners.forEach(cb => cb());
    }
  }

  isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  isPaused(): boolean {
    return this.isPausedInternal;
  }
}

export const ttsService = new TTSService();
