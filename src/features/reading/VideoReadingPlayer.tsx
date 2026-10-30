import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, FileText, AlertCircle } from 'lucide-react';
import { ReadingSentence } from '../../types';

interface VideoReadingPlayerProps {
  videoUrl: string;
  sentences: ReadingSentence[];
  currentSentenceIndex: number;
  onSentenceChange: (index: number) => void;
  onWordContextMenu: (e: React.MouseEvent, word: string, sentence: string, sentenceIndex: number) => void;
}

export const VideoReadingPlayer: React.FC<VideoReadingPlayerProps> = ({
  videoUrl,
  sentences,
  currentSentenceIndex,
  onSentenceChange,
  onWordContextMenu,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Time update listener to sync with active sentence
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (sentences.length > 0 && sentences[0].start !== undefined) {
      const matchIdx = sentences.findIndex(
        (s) => t >= (s.start || 0) && t <= (s.end || Number.MAX_VALUE)
      );
      if (matchIdx >= 0 && matchIdx !== currentSentenceIndex) {
        onSentenceChange(matchIdx);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const jumpToSentence = (sentence: ReadingSentence, idx: number) => {
    if (!videoRef.current) return;
    if (sentence.start !== undefined) {
      videoRef.current.currentTime = sentence.start;
      videoRef.current.play();
      setIsPlaying(true);
    }
    onSentenceChange(idx);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Video Viewport */}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />

        {/* Video Overlay Play/Pause Button on Hover */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="p-4 rounded-full bg-indigo-600/90 text-white shadow-xl hover:scale-105 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          </div>
        </button>

        {/* Bottom Video Controls Strip */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="hover:text-indigo-400">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="font-mono text-[11px] text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="hover:text-indigo-400"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Subtitles Workspace */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-slate-900/60 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Interactive Subtitles & Transcript
            </span>
          </div>
          <span>Right-click any word to inspect</span>
        </div>

        {sentences.length === 0 ? (
          <div className="p-6 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="font-medium text-slate-300">No subtitles were found for this video.</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              You can still watch the video, and you can paste or generate reading transcripts using the "Add My Text" tab.
            </p>
          </div>
        ) : (
          sentences.map((sent, idx) => {
            const isCurrent = idx === currentSentenceIndex;
            const words = sent.text.split(/(\s+)/);

            return (
              <div
                key={sent.id || idx}
                onClick={() => jumpToSentence(sent, idx)}
                className={`p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isCurrent
                    ? 'bg-indigo-950/80 border border-indigo-500/50 text-white font-medium shadow-md'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {sent.start !== undefined && (
                  <span className="inline-block mr-2 px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-indigo-400">
                    {formatTime(sent.start)}
                  </span>
                )}
                <span>
                  {words.map((w, wIdx) => {
                    if (/^\s+$/.test(w)) return <span key={wIdx}>{w}</span>;
                    return (
                      <span
                        key={wIdx}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onWordContextMenu(e, w, sent.text, idx);
                        }}
                        className="hover:text-indigo-400 hover:underline decoration-indigo-400/50 cursor-pointer"
                      >
                        {w}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
