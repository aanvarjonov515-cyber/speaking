import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookMarked,
  Filter,
  Plus,
} from 'lucide-react';
import { SavedWord, WordStatus } from '../../types';
import { DBService } from '../../services/database/dbService';
import { ttsService } from '../../services/tts/ttsService';

interface MyWordsViewProps {
  assistanceLanguage: 'uz' | 'en';
}

export const MyWordsView: React.FC<MyWordsViewProps> = ({ assistanceLanguage }) => {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WordStatus | 'All'>('All');

  useEffect(() => {
    setWords(DBService.getSavedWords());
  }, []);

  const handleStatusChange = (id: string, status: WordStatus) => {
    DBService.updateWordStatus(id, status);
    setWords(DBService.getSavedWords());
  };

  const handleDelete = (id: string) => {
    DBService.deleteWord(id);
    setWords(DBService.getSavedWords());
  };

  const handlePronounce = (word: string) => {
    ttsService.speak(word, { rate: 0.9 });
  };

  const filtered = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.translationUz.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || w.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses: Array<WordStatus | 'All'> = ['All', 'New', 'Learning', 'Difficult', 'Known'];

  return (
    <div className="flex flex-col h-full p-8 max-w-6xl mx-auto space-y-6 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">
              {assistanceLanguage === 'uz' ? 'Mening Soʻzlarim (My Words)' : 'My Words Library'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {words.length} ta saqlangan soʻz va iboralar lugʻati
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Soʻz yoki tarjimani qidirish..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-fit text-xs font-medium">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Words Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <BookMarked className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium text-sm">Hech qanday soʻz topilmadi.</p>
          <p className="text-xs text-slate-500">
            Reading matnida istalgan soʻz ustiga oʻng tugmani bosib "Save Word" qiling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 capitalize">
                      {item.word}
                    </h3>
                    {item.phonetic && (
                      <span className="text-xs font-mono text-indigo-400">{item.phonetic}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handlePronounce(item.word)}
                    title="Pronounce"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 text-sm font-semibold text-emerald-400">
                  {item.translationUz}
                </div>

                {item.simpleMeaning && (
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                    {item.simpleMeaning}
                  </p>
                )}

                {item.examples && item.examples.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 italic">
                    "{item.examples[0]}"
                  </div>
                )}
              </div>

              {/* Status and Action bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as WordStatus)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Learning">Learning</option>
                  <option value="Difficult">Difficult</option>
                  <option value="Known">Known</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Rev: {item.reviewCount}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
