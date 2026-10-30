import React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Volume2,
} from 'lucide-react';

interface SentenceControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onSpeedChange: (speed: number) => void;
}

export const SentenceControls: React.FC<SentenceControlsProps> = ({
  isPlaying,
  isPaused,
  currentSentenceIndex,
  totalSentences,
  speed,
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
  onRepeat,
  onSpeedChange,
}) => {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-lg text-xs">
      {/* Playback Transport Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={currentSentenceIndex <= 0}
          title="Previous Sentence"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        {isPlaying && !isPaused ? (
          <button
            onClick={onPause}
            title="Pause Reading (Space)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            title="Read Aloud (Space)"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? 'Resume' : 'Read'}</span>
          </button>
        )}

        <button
          onClick={onStop}
          disabled={!isPlaying && !isPaused}
          title="Stop Reading"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onNext}
          disabled={currentSentenceIndex >= totalSentences - 1}
          title="Next Sentence"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onRepeat}
          title="Repeat Current Sentence (R)"
          className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Repeat</span>
        </button>
      </div>

      {/* Sentence Counter Progress */}
      <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
        <span className="font-semibold text-slate-200">
          Sentence {totalSentences > 0 ? currentSentenceIndex + 1 : 0}
        </span>
        <span className="text-slate-600">/</span>
        <span>{totalSentences}</span>
      </div>

      {/* Reading Speed Multiplier */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
        <Gauge className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-0.5" />
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              speed === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
