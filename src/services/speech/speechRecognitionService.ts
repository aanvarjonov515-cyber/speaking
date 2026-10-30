type ResultCallback = (transcript: string, isFinal: boolean) => void;
type StateCallback = (state: 'idle' | 'listening' | 'processing' | 'error') => void;
type VolumeCallback = (volumePercent: number) => void;

class SpeechRecognitionService {
  private recognition: any = null;
  private isListeningInternal = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private selectedDeviceId: string | null = null;

  private resultListeners: Set<ResultCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private volumeListeners: Set<VolumeCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListeningInternal = true;
          this.notifyState('listening');
        };

        this.recognition.onend = () => {
          this.isListeningInternal = false;
          this.notifyState('idle');
          this.stopVolumeMonitoring();
        };

        this.recognition.onerror = (e: any) => {
          console.warn('Speech recognition event:', e.error);
          if (e.error !== 'no-speech') {
            this.notifyState('error');
          }
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combined = finalTranscript || interimTranscript;
          if (combined.trim()) {
            this.resultListeners.forEach((cb) => cb(combined.trim(), !!finalTranscript));
          }
        };
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  onResult(cb: ResultCallback) {
    this.resultListeners.add(cb);
    return () => this.resultListeners.delete(cb);
  }

  onStateChange(cb: StateCallback) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  onVolume(cb: VolumeCallback) {
    this.volumeListeners.add(cb);
    return () => this.volumeListeners.delete(cb);
  }

  private notifyState(state: 'idle' | 'listening' | 'processing' | 'error') {
    this.stateListeners.forEach((cb) => cb(state));
  }

  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  setSelectedDevice(deviceId: string) {
    this.selectedDeviceId = deviceId;
  }

  async startListening() {
    if (!this.recognition) return;
    if (this.isListeningInternal) return;

    try {
      await this.startVolumeMonitoring();
      this.recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      this.notifyState('error');
    }
  }

  stopListening() {
    if (this.recognition && this.isListeningInternal) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.isListeningInternal = false;
    this.stopVolumeMonitoring();
    this.notifyState('idle');
  }

  isListening(): boolean {
    return this.isListeningInternal;
  }

  // Audio level monitoring using Web Audio API
  private async startVolumeMonitoring() {
    try {
      const constraints: MediaStreamConstraints = {
        audio: this.selectedDeviceId ? { deviceId: { exact: this.selectedDeviceId } } : true,
      };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((avg / 128) * 100));

        this.volumeListeners.forEach((cb) => cb(volumePercent));
        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Volume meter setup failed:', err);
    }
  }

  private stopVolumeMonitoring() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.volumeListeners.forEach((cb) => cb(0));
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
