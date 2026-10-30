import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  Award,
  BookOpen,
  ArrowLeft,
  Settings,
  HelpCircle,
  Sparkles,
  Mic,
} from 'lucide-react';
import { AppSettings, HighlightMarker, ReadingText, SavedWord } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { DBService } from '../../services/database/dbService';
import { ReadingTextView } from './ReadingTextView';
import { SentenceControls } from './SentenceControls';
import { TeacherAvatar3D } from '../teacher/TeacherAvatar3D';
import { TeacherChat } from '../teacher/TeacherChat';
import { WordContextMenu } from './WordContextMenu';
import { MiniDictionary } from './MiniDictionary';
import { PhraseToolbar } from './PhraseToolbar';
import { VideoReadingPlayer } from './VideoReadingPlayer';
import { PracticeModal } from './PracticeModal';

interface ReadingWorkspaceProps {
  text: ReadingText;
  settings: AppSettings;
  onBackToHome: () => void;
  onUpdateText: (updated: ReadingText) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onDiscussInSpeaking?: (text: ReadingText) => void;
}

export const ReadingWorkspace: React.FC<ReadingWorkspaceProps> = ({
  text,
  settings,
  onBackToHome,
  onUpdateText,
  onUpdateSettings,
  onDiscussInSpeaking,
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(text.currentSentenceIndex || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlights, setHighlights] = useState<HighlightMarker[]>([]);
  const [readingTheme, setReadingTheme] = useState<'dark' | 'light'>('dark');
  const [showPractice, setShowPractice] = useState(false);

  // Popovers & Context state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    word: string;
    sentence: string;
    sentenceIndex: number;
  } | null>(null);

  const [miniDict, setMiniDict] = useState<{
    x: number;
    y: number;
    word: string;
    sentence: string;
  } | null>(null);

  const [phraseToolbar, setPhraseToolbar] = useState<{
    x: number;
    y: number;
    text: string;
    sentence: string;
  } | null>(null);

  // Selected word for teacher chat focus
  const [focusedWord, setFocusedWord] = useState<string | undefined>(undefined);

  // Session timer tracking
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    setHighlights(DBService.getHighlights(text.id));
    setCurrentSentenceIndex(text.currentSentenceIndex || 0);

    return () => {
      // Save elapsed reading minutes upon leaving workspace
      const elapsedMins = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 60000));
      DBService.addReadingMinutes(elapsedMins);
      ttsService.stop();
    };
  }, [text.id]);

  // TTS Start/Stop/Sequence logic
  const playSentence = (idx: number) => {
    if (idx < 0 || idx >= text.sentences.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    setCurrentSentenceIndex(idx);
    setIsPlaying(true);
    setIsPaused(false);

    // Update progress in database
    const progressPercent = Math.round(((idx + 1) / text.sentences.length) * 100);
    const updated = {
      ...text,
      currentSentenceIndex: idx,
      progressPercent: Math.max(text.progressPercent, progressPercent),
      lastReadAt: Date.now(),
    };
    onUpdateText(updated);
    DBService.saveText(updated);

    const sentenceText = text.sentences[idx].text;
    ttsService.speak(sentenceText, {
      rate: settings.voiceSpeed,
      onEnd: () => {
        // Auto-advance to next sentence
        if (idx + 1 < text.sentences.length) {
          playSentence(idx + 1);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      },
    });
  };

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    ttsService.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePrevSentence = () => {
    const nextIdx = Math.max(0, currentSentenceIndex - 1);
    playSentence(nextIdx);
  };

  const handleNextSentence = () => {
    const nextIdx = Math.min(text.sentences.length - 1, currentSentenceIndex + 1);
    playSentence(nextIdx);
  };

  const handleRepeat = () => {
    playSentence(currentSentenceIndex);
  };

  // Keyboard Shortcuts (Space: Play/Pause, Esc: close popup, R: repeat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying && !isPaused) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        } else {
          playSentence(currentSentenceIndex);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        handleRepeat();
      } else if (e.key === 'Escape') {
        setContextMenu(null);
        setMiniDict(null);
        setPhraseToolbar(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, currentSentenceIndex]);

  // Context Menu Trigger
  const handleWordContextMenu = (
    e: React.MouseEvent,
    word: string,
    sentence: string,
    sentenceIndex: number
  ) => {
    setMiniDict(null);
    setPhraseToolbar(null);
    setFocusedWord(word);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      word,
      sentence,
      sentenceIndex,
    });
  };

  // Double Click Trigger
  const handleWordDoubleClick = (e: React.MouseEvent, word: string, sentence: string) => {
    setContextMenu(null);
    setPhraseToolbar(null);
    setFocusedWord(word);
    setMiniDict({
      x: e.clientX,
      y: e.clientY,
      word,
      sentence,
    });
  };

  // Multi-word selection
  const handleTextSelection = (e: React.MouseEvent, selectedText: string, sentence: string) => {
    setContextMenu(null);
    setMiniDict(null);
    setPhraseToolbar({
      x: e.clientX,
      y: e.clientY,
      text: selectedText,
      sentence,
    });
  };

  const handleAskTeacher = (word: string, contextSentence: string) => {
    setFocusedWord(word);
  };

  return (
    <div
      onClick={() => {
        setContextMenu(null);
        setMiniDict(null);
        setPhraseToolbar(null);
      }}
      className="flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100"
    >
      {/* Workspace Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kutubxona</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <h2 className="font-bold text-slate-200 truncate max-w-sm">{text.title}</h2>
          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[11px] font-bold">
            {text.level}
          </span>
        </div>

        {/* Right Toolbar Controls: Font A-/A+, Theme, Practice, Focus Mode */}
        <div className="flex items-center gap-2">
          {/* Font Size A- / A+ */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() =>
                onUpdateSettings({ readingFontSize: Math.max(14, settings.readingFontSize - 1) })
              }
              title="Kichikroq shrift (Ctrl -)"
              className="px-2 py-1 text-slate-300 hover:text-white text-xs font-semibold"
            >
              A-
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {settings.readingFontSize}px
            </span>
            <button
              onClick={() =>
                onUpdateSettings({ readingFontSize: Math.min(26, settings.readingFontSize + 1) })
              }
              title="Kattaroq shrift (Ctrl +)"
              className="px-2 py-1 text-slate-300 hover:text-white text-xs font-semibold"
            >
              A+
            </button>
          </div>

          {/* Reading Dark / Light Mode Switch */}
          <button
            onClick={() => setReadingTheme(readingTheme === 'dark' ? 'light' : 'dark')}
            title="Matn foni rejimi (Dark / Light)"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {readingTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Practice Quiz Trigger */}
          <button
            onClick={() => setShowPractice(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>

          {/* Discuss in Speaking Studio Trigger */}
          {onDiscussInSpeaking && (
            <button
              onClick={() => onDiscussInSpeaking(text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm cursor-pointer"
              title="Discuss this text with your 3D Teacher in Speaking Studio"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Discuss</span>
            </button>
          )}

          {/* Focus Mode Toggle */}
          <button
            onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
            title={settings.focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            className={`p-1.5 rounded-lg transition-colors ${
              settings.focusMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {settings.focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3-Zone Workspace Body */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left / Center Zone: Reading Text View (or Video Player) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden space-y-3">
          <div className="flex-1 overflow-hidden">
            {text.sourceType === 'video' && text.videoUrl ? (
              <VideoReadingPlayer
                videoUrl={text.videoUrl}
                sentences={text.sentences}
                currentSentenceIndex={currentSentenceIndex}
                onSentenceChange={(idx) => setCurrentSentenceIndex(idx)}
                onWordContextMenu={handleWordContextMenu}
              />
            ) : (
              <ReadingTextView
                text={text}
                currentSentenceIndex={currentSentenceIndex}
                isPlaying={isPlaying}
                highlights={highlights}
                fontSize={settings.readingFontSize}
                lineHeight={settings.readingLineHeight}
                fontFamily={settings.readingFontFamily}
                theme={readingTheme}
                assistanceLanguage={settings.assistanceLanguage}
                onSentenceClick={(idx) => playSentence(idx)}
                onWordContextMenu={handleWordContextMenu}
                onWordDoubleClick={handleWordDoubleClick}
                onTextSelection={handleTextSelection}
              />
            )}
          </div>

          {/* Bottom Transport Controls Strip */}
          <SentenceControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            currentSentenceIndex={currentSentenceIndex}
            totalSentences={text.sentences.length}
            speed={settings.voiceSpeed}
            onPlay={() => playSentence(currentSentenceIndex)}
            onPause={handlePause}
            onStop={handleStop}
            onPrev={handlePrevSentence}
            onNext={handleNextSentence}
            onRepeat={handleRepeat}
            onSpeedChange={(s) => onUpdateSettings({ voiceSpeed: s })}
          />
        </div>

        {/* Right Zone: 3D VRM Teacher & Contextual Chat (Collapsible in focus mode) */}
        {!settings.focusMode && (
          <div className="w-[380px] flex flex-col h-full gap-3 shrink-0">
            {/* 3D Teacher Avatar */}
            <div className="h-[46%] w-full">
              <TeacherAvatar3D
                isSpeaking={isPlaying && !isPaused}
                vrmUrl={settings.vrmModelUrl}
              />
            </div>

            {/* Context-aware Teacher Chat */}
            <div className="flex-1 overflow-hidden">
              <TeacherChat
                currentTextTitle={text.title}
                currentSentence={text.sentences[currentSentenceIndex]?.text}
                selectedWord={focusedWord}
                readingContext={text.content}
                assistanceLanguage={settings.assistanceLanguage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Word Context Menu Popover */}
      {contextMenu && (
        <WordContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          word={contextMenu.word}
          sentence={contextMenu.sentence}
          sentenceIndex={contextMenu.sentenceIndex}
          textId={text.id}
          textTitle={text.title}
          assistanceLanguage={settings.assistanceLanguage}
          onClose={() => setContextMenu(null)}
          onAskTeacher={handleAskTeacher}
          onWordSaved={() => setHighlights(DBService.getHighlights(text.id))}
          onHighlightAdded={() => setHighlights(DBService.getHighlights(text.id))}
        />
      )}

      {/* Floating Mini Dictionary (Double Click) */}
      {miniDict && (
        <MiniDictionary
          x={miniDict.x}
          y={miniDict.y}
          word={miniDict.word}
          contextSentence={miniDict.sentence}
          textId={text.id}
          textTitle={text.title}
          onClose={() => setMiniDict(null)}
          onMoreDetails={(word) => {
            setContextMenu({
              x: miniDict.x,
              y: miniDict.y,
              word,
              sentence: miniDict.sentence,
              sentenceIndex: currentSentenceIndex,
            });
          }}
        />
      )}

      {/* Floating Phrase Toolbar (Multi-word highlight) */}
      {phraseToolbar && (
        <PhraseToolbar
          x={phraseToolbar.x}
          y={phraseToolbar.y}
          selectedText={phraseToolbar.text}
          contextSentence={phraseToolbar.sentence}
          textId={text.id}
          onClose={() => setPhraseToolbar(null)}
          onAskAI={(p) => setFocusedWord(p)}
        />
      )}

      {/* Practice & Comprehension Modal */}
      <PracticeModal
        isOpen={showPractice}
        text={text}
        assistanceLanguage={settings.assistanceLanguage}
        onClose={() => setShowPractice(false)}
      />
    </div>
  );
};
