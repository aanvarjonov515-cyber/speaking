import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Languages,
  BookOpen,
  StickyNote,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react';
import { HighlightMarker, ReadingSentence, ReadingText } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { aiService } from '../../services/ai/aiService';

interface ReadingTextViewProps {
  text: ReadingText;
  currentSentenceIndex: number;
  isPlaying: boolean;
  highlights: HighlightMarker[];
  fontSize: number;
  lineHeight: number;
  fontFamily: 'sans' | 'serif';
  theme: 'dark' | 'light';
  assistanceLanguage: 'uz' | 'en';
  onSentenceClick: (index: number) => void;
  onWordContextMenu: (e: React.MouseEvent, word: string, sentence: string, sentenceIndex: number) => void;
  onWordDoubleClick: (e: React.MouseEvent, word: string, sentence: string) => void;
  onTextSelection: (e: React.MouseEvent, selectedText: string, sentence: string) => void;
}

export const ReadingTextView: React.FC<ReadingTextViewProps> = ({
  text,
  currentSentenceIndex,
  isPlaying,
  highlights,
  fontSize,
  lineHeight,
  fontFamily,
  theme,
  assistanceLanguage,
  onSentenceClick,
  onWordContextMenu,
  onWordDoubleClick,
  onTextSelection,
}) => {
  const [activeSentenceMenu, setActiveSentenceMenu] = useState<number | null>(null);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<Record<number, any>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<number | null>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Scroll active sentence into view smoothly when playing
  useEffect(() => {
    if (isPlaying && sentenceRefs.current[currentSentenceIndex]) {
      sentenceRefs.current[currentSentenceIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSentenceIndex, isPlaying]);

  const handleSelection = (e: React.MouseEvent, sentenceText: string) => {
    const selection = window.getSelection();
    const str = selection ? selection.toString().trim() : '';
    if (str.length > 2 && str.includes(' ')) {
      onTextSelection(e, str, sentenceText);
    }
  };

  const handleTranslateSentence = async (idx: number, sentenceText: string) => {
    if (sentenceAnalysis[idx]?.translation) {
      return;
    }
    setLoadingAnalysis(idx);
    try {
      const res = await aiService.analyzeSentence(sentenceText, text.level, assistanceLanguage);
      setSentenceAnalysis((prev) => ({ ...prev, [idx]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const handleAnalyzeGrammar = async (idx: number, sentenceText: string) => {
    if (sentenceAnalysis[idx]?.tense) {
      return;
    }
    setLoadingAnalysis(idx);
    try {
      const res = await aiService.analyzeSentence(sentenceText, text.level, assistanceLanguage);
      setSentenceAnalysis((prev) => ({ ...prev, [idx]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(null);
    }
  };

  // Helper to render words with highlight and note decorations
  const renderSentenceWords = (sentence: ReadingSentence, sentenceIdx: number) => {
    const words = sentence.text.split(/(\s+)/);

    return words.map((w, wIdx) => {
      if (/^\s+$/.test(w)) return <span key={wIdx}>{w}</span>;

      const cleanW = w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').toLowerCase();
      const marker = highlights.find(
        (h) => h.sentenceIndex === sentenceIdx && h.word.toLowerCase() === cleanW
      );

      let highlightClass = '';
      if (marker) {
        if (marker.type === 'important') highlightClass = 'hl-important text-amber-200 font-medium';
        else if (marker.type === 'unknown') highlightClass = 'hl-unknown text-rose-200 font-medium';
        else if (marker.type === 'grammar') highlightClass = 'hl-grammar text-indigo-200 font-medium';
        else if (marker.type === 'learn_later') highlightClass = 'hl-learn_later text-emerald-200 font-medium';
      }

      return (
        <span
          key={wIdx}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWordContextMenu(e, w, sentence.text, sentenceIdx);
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWordDoubleClick(e, w, sentence.text);
          }}
          className={`relative inline cursor-pointer hover:text-indigo-400 hover:underline decoration-indigo-400/60 underline-offset-4 transition-colors ${highlightClass}`}
          title="Right-click for options · Double-click for definition"
        >
          {w}
          {marker?.noteText && (
            <span
              className="inline-block ml-0.5 text-xs text-amber-400 cursor-help"
              title={`Eslatma: ${marker.noteText}`}
            >
              📝
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div
      onMouseUp={(e) => {
        if (text.sentences[currentSentenceIndex]) {
          handleSelection(e, text.sentences[currentSentenceIndex].text);
        }
      }}
      className={`relative w-full h-full p-8 overflow-y-auto rounded-2xl border transition-colors ${
        theme === 'light'
          ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
          : 'bg-slate-900/60 text-slate-100 border-slate-800/80 shadow-2xl'
      }`}
      style={{
        fontFamily: fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)',
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
      }}
    >
      {/* Article Header */}
      <div className="mb-8 pb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
          <span>{text.topic}</span>
          <span className="text-slate-500">·</span>
          <span>Level {text.level}</span>
          <span className="text-slate-500">·</span>
          <span>{text.sentences.length} sentences</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          {text.title}
        </h1>
      </div>

      {/* Sentences Body */}
      <div className="space-y-4">
        {text.sentences.map((sentence, idx) => {
          const isCurrent = idx === currentSentenceIndex;
          const analysis = sentenceAnalysis[idx];
          const isLoading = loadingAnalysis === idx;

          return (
            <div key={sentence.id || idx} className="group relative">
              <span
                ref={(el) => {
                  sentenceRefs.current[idx] = el;
                }}
                onClick={() => onSentenceClick(idx)}
                className={`inline rounded-lg px-2 py-1 transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/80 text-white font-medium ring-1 ring-indigo-500/50 shadow-sm'
                    : 'hover:bg-slate-800/40 text-slate-200'
                }`}
              >
                {renderSentenceWords(sentence, idx)}
              </span>

              {/* Hover / Active Sentence Toolbar Pill */}
              <div
                className={`inline-flex items-center gap-1.5 ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity align-middle ${
                  isCurrent ? 'opacity-100' : ''
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSentenceClick(idx);
                    ttsService.speak(sentence.text);
                  }}
                  title="Read this sentence"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTranslateSentence(idx, sentence.text);
                  }}
                  title="Translate sentence to Uzbek"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                >
                  <Languages className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyzeGrammar(idx, sentence.text);
                  }}
                  title="Analyze sentence grammar"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-violet-400 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Sentence Analysis Card if triggered */}
              {(isLoading || analysis) && (
                <div className="mt-2 mb-3 p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>Gap tahlil qilinmoqda...</span>
                    </div>
                  ) : (
                    <>
                      {analysis.translation && (
                        <div>
                          <div className="text-slate-400 text-[11px] font-medium">Oʻzbekcha maʻnosi:</div>
                          <div className="text-sm font-semibold text-emerald-300 mt-0.5">
                            {analysis.translation}
                          </div>
                        </div>
                      )}

                      {analysis.tense && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
                          <div>
                            <span className="text-slate-400">Zamon (Tense): </span>
                            <span className="font-mono text-indigo-300 font-semibold">{analysis.tense}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Feʻl strukturasi: </span>
                            <span className="font-mono text-slate-200">{analysis.verbStructure}</span>
                          </div>
                        </div>
                      )}

                      {analysis.explanation && (
                        <div className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
                          {analysis.explanation}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
