import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  Volume2,
  Check,
  AlertTriangle,
  Play,
  Square,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { speechRecognitionService } from '../../services/speech/speechRecognitionService';

interface MicSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed?: () => void;
}

export const MicSetupModal: React.FC<MicSetupModalProps> = ({
  isOpen,
  onClose,
  onConfirmed,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(5);
  const [noiseWarning, setNoiseWarning] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    speechRecognitionService.stopListening();
  };

  const loadDevices = async () => {
    try {
      const devs = await speechRecognitionService.getAudioInputDevices();
      setDevices(devs);
      if (devs.length > 0 && !selectedDevice) {
        setSelectedDevice(devs[0].deviceId);
      }
    } catch (e) {
      console.warn('Could not list audio devices:', e);
    }
  };

  const handleStartTest = async () => {
    setIsTesting(true);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];
    setRecordingSeconds(5);
    setNoiseWarning(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
      });

      // Volume monitoring
      speechRecognitionService.onVolume((v) => {
        setVolume(v);
        if (v > 75) setNoiseWarning(true);
      });
      await speechRecognitionService.startListening();

      // Record 5 seconds
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setIsTesting(false);
        speechRecognitionService.stopListening();
      };

      recorder.start();

      let sec = 5;
      timerRef.current = setInterval(() => {
        sec -= 1;
        setRecordingSeconds(sec);
        if (sec <= 0) {
          clearInterval(timerRef.current);
          recorder.stop();
          stream.getTracks().forEach((t) => t.stop());
        }
      }, 1000);
    } catch (err: any) {
      alert('Mikrofon ruxsati berilmadi yoki xatolik: ' + err?.message);
      setIsTesting(false);
    }
  };

  const handlePlayback = () => {
    if (!recordedAudioUrl) return;
    const audio = new Audio(recordedAudioUrl);
    setIsPlayingBack(true);
    audio.play();
    audio.onended = () => setIsPlayingBack(false);
    audio.onerror = () => setIsPlayingBack(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Microphone Setup</h2>
              <p className="text-xs text-slate-400">Audio kiritish qurilmasini tekshirish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Device selector */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">Input Audio Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                speechRecognitionService.setSelectedDevice(e.target.value);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {devices.length === 0 ? (
                <option value="">Default Microphone</option>
              ) : (
                devices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Volume Meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Input Level Meter</span>
              <span className="font-mono text-indigo-400">{volume}%</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  volume > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(4, volume)}%` }}
              />
            </div>
          </div>

          {/* Noise warning indicator */}
          {noiseWarning && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Background noise is high. Pronunciation scores may be less accurate.</span>
            </div>
          )}

          {/* 5-second test recording */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">Test Record (5 seconds)</span>
              {isTesting && (
                <span className="text-rose-400 font-mono font-bold animate-pulse">
                  {recordingSeconds}s
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Mikrofoningiz qanday eshitilayotganini 5 soniya yozib tinglab koʻring.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium shadow-sm transition-colors"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Yozilmoqda...' : 'Start 5s Test'}</span>
              </button>

              {recordedAudioUrl && (
                <button
                  type="button"
                  onClick={handlePlayback}
                  disabled={isPlayingBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-300 font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingBack ? 'Oʻynalmoqda...' : 'Tinglab koʻrish'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={() => {
              cleanup();
              onConfirmed?.();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            Tayyor & Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};
