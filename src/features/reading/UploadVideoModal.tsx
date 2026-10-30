import React, { useState } from 'react';
import { ReadingText, ReadingSentence } from '../../types';
import { Film, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoLoaded: (videoText: ReadingText) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  onVideoLoaded,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [parsing, setParsing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubtitleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubtitleFile(e.target.files[0]);
    }
  };

  const handleProcessVideo = async () => {
    if (!videoFile) return;
    setParsing(true);
    setStatusMessage(null);

    const videoUrl = URL.createObjectURL(videoFile);
    let parsedSentences: ReadingSentence[] = [];

    if (subtitleFile) {
      try {
        const textContent = await subtitleFile.text();
        // Parse simple WebVTT or SRT
        const lines = textContent.split(/\r?\n/);
        let idCounter = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.includes('-->') && !/^\d+$/.test(trimmed) && trimmed !== 'WEBVTT') {
            parsedSentences.push({
              id: idCounter++,
              text: trimmed,
            });
          }
        }
      } catch (err) {
        console.warn('Subtitle parse error:', err);
      }
    }

    if (parsedSentences.length === 0) {
      setStatusMessage('Subtitles not detected in file. Video loaded for playback practice.');
      parsedSentences = [
        {
          id: 0,
          text: 'No subtitles detected for this video file.',
        },
      ];
    }

    const videoText: ReadingText = {
      id: 'video_' + Date.now(),
      title: videoTitle || videoFile.name,
      topic: 'Media / Video Practice',
      level: 'A2',
      content: parsedSentences.map((s) => s.text).join(' '),
      sentences: parsedSentences,
      sourceType: 'video',
      videoUrl: videoUrl,
      createdAt: Date.now(),
      lastReadAt: Date.now(),
      progressPercent: 0,
      currentSentenceIndex: 0,
    };

    setParsing(false);
    onVideoLoaded(videoText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Film className="w-5 h-5" />
            <span>Kompyuterdan Video Yuklash (Real Video Reading)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Video Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Video Nomi:</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Masalan: English Interview Lesson 1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>

          {/* Video File Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Video Fayli (MP4, WebM):</label>
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 cursor-pointer transition-colors text-center">
              <Upload className="w-6 h-6 text-cyan-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">
                {videoFile ? videoFile.name : 'Kompyuterdan video faylini tanlang'}
              </span>
              <input type="file" accept="video/mp4,video/webm" onChange={handleVideoSelect} className="hidden" />
            </label>
          </div>

          {/* Subtitle File Input (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Subtitr Fayli (WebVTT, SRT - Ixcham):</label>
            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 cursor-pointer transition-colors text-xs text-slate-300">
              <Film className="w-4 h-4 text-indigo-400" />
              <span className="truncate">{subtitleFile ? subtitleFile.name : 'Subtitr faylini tanlash (optional)'}</span>
              <input type="file" accept=".vtt,.srt" onChange={handleSubtitleSelect} className="hidden" />
            </label>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
          >
            Bekor qilish
          </button>
          <button
            disabled={!videoFile || parsing}
            onClick={handleProcessVideo}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            {parsing ? (
              <span>Yuklanmoqda...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Videoni Ochish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
