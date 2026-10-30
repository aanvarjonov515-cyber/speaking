import React, { useState } from 'react';
import {
  Volume2,
  Languages,
  Lightbulb,
  FileText,
  BookOpen,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Highlighter,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { HighlightType, SavedWord } from '../../types';
import { ttsService } from '../../services/tts/ttsService';
import { aiService } from '../../services/ai/aiService';
import { DBService } from '../../services/database/dbService';

interface WordContextMenuProps {
  x: number;
  y: number;
  word: string;
  sentence: string;
  sentenceIndex: number;
  textId: string;
  textTitle: string;
  assistanceLanguage: 'uz' | 'en';
  onClose: () => void;
  onAskTeacher: (word: string, contextSentence: string) => void;
  onWordSaved?: (word: SavedWord) => void;
  onHighlightAdded?: () => void;
}

export const WordContextMenu: React.FC<WordContextMenuProps> = ({
  x,
  y,
  word,
  sentence,
  sentenceIndex,
  textId,
  textTitle,
  assistanceLanguage,
  onClose,
  onAskTeacher,
  onWordSaved,
  onHighlightAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'translate' | 'explain' | 'examples' | 'grammar' | 'note'>('menu');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Position bounds safety for screen edge
  const menuWidth = 240;
  const menuHeight = 320;
  const left = Math.min(x, window.innerWidth - menuWidth - 16);
  const top = Math.min(y, window.innerHeight - menuHeight - 16);

  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();

  // Load full AI word analysis
  const fetchWordAnalysis = async () => {
    if (data) return data;
    setLoading(true);
    try {
      const res = await aiService.analyzeWord({
        word: cleanWord,
        sentence,
        lang: assistanceLanguage,
      });
      setData(res);
      return res;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = () => {
    ttsService.speak(cleanWord, { rate: 0.9 });
  };

  const handleOpenTab = async (tab: 'translate' | 'explain' | 'examples' | 'grammar') => {
    setActiveTab(tab);
    await fetchWordAnalysis();
  };

  const handleSaveWord = async () => {
    setLoading(true);
    try {
      let analysis = data;
      if (!analysis) {
        analysis = await fetchWordAnalysis();
      }

      const saved = DBService.addWord({
        word: cleanWord,
        phonetic: analysis?.phonetic || '',
        translationUz: analysis?.translation || 'Tarjima kutilmoqda',
        partOfSpeech: analysis?.partOfSpeech || 'word',
        simpleMeaning: analysis?.simpleMeaning || '',
        forms: analysis?.forms || '',
        examples: analysis?.examples || [sentence],
        sourceTextId: textId,
        sourceTextTitle: textTitle,
        sourceSentence: sentence,
        status: 'New',
      });

      setIsSaved(true);
      setSaveSuccessMsg(assistanceLanguage === 'uz' ? 'Soʻz saqlandi!' : 'Word saved!');
      onWordSaved?.(saved);
      setTimeout(() => setSaveSuccessMsg(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    DBService.addHighlight({
      textId,
      sentenceIndex,
      word: cleanWord,
      type: 'note',
      noteText: noteInput.trim(),
    });
    onHighlightAdded?.();
    setActiveTab('menu');
    onClose();
  };

  const handleAddHighlight = (type: HighlightType) => {
    DBService.addHighlight({
      textId,
      sentenceIndex,
      word: cleanWord,
      type,
    });
    onHighlightAdded?.();
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl text-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
      style={{ top: `${top}px`, left: `${left}px`, width: `${menuWidth}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center gap-1.5 font-semibold text-slate-100 truncate">
          <span className="text-indigo-400 capitalize">{cleanWord}</span>
          {data?.phonetic && (
            <span className="text-[11px] font-mono text-slate-400">{data.phonetic}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded hover:bg-slate-700/50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 px-3 py-1 text-center font-medium flex items-center justify-center gap-1 text-[11px]">
          <Check className="w-3 h-3" /> {saveSuccessMsg}
        </div>
      )}

      {/* Main Menu View */}
      {activeTab === 'menu' && (
        <div className="p-1.5 space-y-0.5">
          <button
            onClick={handlePronounce}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{assistanceLanguage === 'uz' ? 'Ovoz chiqarish (Pronounce)' : 'Pronounce'}</span>
          </button>

          <button
            onClick={() => handleOpenTab('translate')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{assistanceLanguage === 'uz' ? 'Tarjima (Translate)' : 'Translate'}</span>
          </button>

          <button
            onClick={() => handleOpenTab('explain')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{assistanceLanguage === 'uz' ? 'Tushuntirish (Explain)' : 'Explain'}</span>
          </button>

          <button
            onClick={() => handleOpenTab('examples')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{assistanceLanguage === 'uz' ? 'Misollar (Examples)' : 'Examples'}</span>
          </button>

          <button
            onClick={() => handleOpenTab('grammar')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>{assistanceLanguage === 'uz' ? 'Grammatika (Grammar)' : 'Grammar'}</span>
          </button>

          <button
            onClick={() => {
              onAskTeacher(cleanWord, sentence);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>{assistanceLanguage === 'uz' ? 'Oʻqituvchidan soʻrash' : 'Ask Teacher'}</span>
          </button>

          <button
            onClick={handleSaveWord}
            disabled={loading || isSaved}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200 disabled:opacity-60"
          >
            {isSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isSaved ? 'Saqlangan' : assistanceLanguage === 'uz' ? 'Soʻzni saqlash (Save)' : 'Save Word'}</span>
          </button>

          <button
            onClick={() => setActiveTab('note')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition-colors text-slate-200"
          >
            <StickyNote className="w-3.5 h-3.5 text-orange-400" />
            <span>{assistanceLanguage === 'uz' ? 'Izoh qoʻshish (Add Note)' : 'Add Note'}</span>
          </button>

          {/* Highlight Palette */}
          <div className="pt-1 mt-1 border-t border-slate-800/80">
            <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
              <Highlighter className="w-3 h-3" />
              <span>{assistanceLanguage === 'uz' ? 'Belgilash turi' : 'Highlight'}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 px-1.5 pb-1">
              <button
                onClick={() => handleAddHighlight('important')}
                title="Muhim (Important)"
                className="py-1 text-center rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[10px]"
              >
                Muhim
              </button>
              <button
                onClick={() => handleAddHighlight('unknown')}
                title="Noma'lum (Unknown)"
                className="py-1 text-center rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-[10px]"
              >
                Yangi
              </button>
              <button
                onClick={() => handleAddHighlight('grammar')}
                title="Grammar"
                className="py-1 text-center rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-[10px]"
              >
                Qoida
              </button>
              <button
                onClick={() => handleAddHighlight('learn_later')}
                title="Keyinroq (Learn later)"
                className="py-1 text-center rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[10px]"
              >
                Keyin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view: Translate / Explain / Examples / Grammar */}
      {activeTab !== 'menu' && activeTab !== 'note' && (
        <div className="p-3 space-y-2.5 max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-medium text-slate-300 capitalize">{activeTab}</span>
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              ← Orqaga
            </button>
          </div>

          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Maʻlumot tayyorlanmoqda...</span>
            </div>
          ) : (
            <>
              {activeTab === 'translate' && (
                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[11px]">Oʻzbekcha maʻnosi:</div>
                  <div className="text-sm font-semibold text-emerald-300">
                    {data?.translation || 'Tarjima topilmadi'}
                  </div>
                  {data?.partOfSpeech && (
                    <div className="text-[11px] text-slate-400">
                      Turkumi: <span className="text-slate-300">{data.partOfSpeech}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'explain' && (
                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[11px]">Oddiy inglizcha taʻrif:</div>
                  <div className="text-slate-200 leading-relaxed bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                    {data?.simpleMeaning || 'Taʻrif yuklanmadi'}
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-2">
                  <div className="text-slate-400 text-[11px]">Namunalar:</div>
                  {data?.examples?.map((ex: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300 leading-snug"
                    >
                      {idx + 1}. {ex}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'grammar' && (
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400">Soʻz turkumi: </span>
                    <span className="font-semibold text-indigo-300">{data?.partOfSpeech}</span>
                  </div>
                  {data?.forms && (
                    <div>
                      <span className="text-slate-400">Shakllari: </span>
                      <div className="text-slate-200 font-mono text-[11px] mt-0.5">{data.forms}</div>
                    </div>
                  )}
                  {data?.grammarNote && (
                    <div className="text-slate-300 bg-slate-800/60 p-2 rounded border border-slate-700/60 text-[11px]">
                      {data.grammarNote}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sub-view: Add Note */}
      {activeTab === 'note' && (
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-medium text-slate-300">Izoh yozish</span>
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              ← Orqaga
            </button>
          </div>
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={`"${cleanWord}" soʻzi boʻyicha eslatma...`}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSaveNote}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Saqlash
          </button>
        </div>
      )}
    </div>
  );
};
