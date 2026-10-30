import React, { useEffect, useState } from 'react';
import { Volume2, Bookmark, BookmarkCheck, ExternalLink, X, Loader2 } from 'lucide-react';
import { ttsService } from '../../services/tts/ttsService';
import { aiService } from '../../services/ai/aiService';
import { DBService } from '../../services/database/dbService';

interface MiniDictionaryProps {
  x: number;
  y: number;
  word: string;
  contextSentence: string;
  textId: string;
  textTitle: string;
  onClose: () => void;
  onMoreDetails: (word: string) => void;
}

export const MiniDictionary: React.FC<MiniDictionaryProps> = ({
  x,
  y,
  word,
  contextSentence,
  textId,
  textTitle,
  onClose,
  onMoreDetails,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();

  useEffect(() => {
    let isMounted = true;
    aiService
      .analyzeWord({ word: cleanWord, sentence: contextSentence })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [cleanWord, contextSentence]);

  const handlePronounce = () => {
    ttsService.speak(cleanWord, { rate: 0.9 });
  };

  const handleSave = () => {
    DBService.addWord({
      word: cleanWord,
      phonetic: data?.phonetic || '',
      translationUz: data?.translation || 'Saqlandi',
      partOfSpeech: data?.partOfSpeech || 'word',
      simpleMeaning: data?.simpleMeaning || '',
      examples: data?.examples || [contextSentence],
      sourceTextId: textId,
      sourceTextTitle: textTitle,
      sourceSentence: contextSentence,
      status: 'New',
    });
    setSaved(true);
  };

  const left = Math.min(x, window.innerWidth - 260);
  const top = Math.max(16, y - 90);

  return (
    <div
      className="fixed z-50 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-3 w-64 text-slate-100 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 text-xs"
      style={{ left: `${left}px`, top: `${top}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-slate-100">
          <span className="text-indigo-400 capitalize">{cleanWord}</span>
          {data?.partOfSpeech && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {data.partOfSpeech}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="py-3 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Lugʻat ochilmoqda...</span>
        </div>
      ) : (
        <div className="py-2 space-y-1.5">
          <div className="text-emerald-300 font-medium text-sm">
            {data?.translation || 'Tarjima kutilmoqda'}
          </div>
          {data?.phonetic && (
            <div className="text-slate-400 font-mono text-[11px]">{data.phonetic}</div>
          )}
          {data?.simpleMeaning && (
            <div className="text-slate-300 text-[11px] leading-snug line-clamp-2">
              {data.simpleMeaning}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePronounce}
            title="Pronounce"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            title="Save Word"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:text-emerald-400 transition-colors"
          >
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={() => {
            onMoreDetails(cleanWord);
            onClose();
          }}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded hover:bg-indigo-500/10 transition-colors"
        >
          <span>Batafsil</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
