import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Search,
  Headphones,
  Award,
  Zap,
} from 'lucide-react';
import { ttsService } from '../../services/tts/ttsService';
import { speechRecognitionService } from '../../services/speech/speechRecognitionService';

interface MinimalPair {
  id: string;
  category: string;
  soundA: string;
  soundB: string;
  wordA: string;
  wordB: string;
  phoneticA: string;
  phoneticB: string;
  meaningUzA: string;
  meaningUzB: string;
  tipUz: string;
}

const MINIMAL_PAIRS: MinimalPair[] = [
  {
    id: 'mp-1',
    category: 'Vowels: Short /ɪ/ vs Long /iː/',
    soundA: '/ɪ/',
    soundB: '/iː/',
    wordA: 'Ship',
    wordB: 'Sheep',
    phoneticA: '/ʃɪp/',
    phoneticB: '/ʃiːp/',
    meaningUzA: 'Kema',
    meaningUzB: 'Qoʻy',
    tipUz: 'Qisqa /ɪ/ da jagʻ erkin, lablar tabassum qilmaydi. Uzun /iː/ da lablar keng yoyiladi va tovush choʻziladi.',
  },
  {
    id: 'mp-2',
    category: 'Vowels: Short /ɪ/ vs Long /iː/',
    soundA: '/ɪ/',
    soundB: '/iː/',
    wordA: 'Live',
    wordB: 'Leave',
    phoneticA: '/lɪv/',
    phoneticB: '/liːv/',
    meaningUzA: 'Yashamoq',
    meaningUzB: 'Tark etmoq',
    tipUz: 'Live soʻzida unli qisqa va boʻshashgan, Leave soʻzida esa lablar jilmaygan holatda.',
  },
  {
    id: 'mp-3',
    category: 'Consonants: Voiceless /θ/ vs /s/',
    soundA: '/θ/',
    soundB: '/s/',
    wordA: 'Think',
    wordB: 'Sink',
    phoneticA: '/θɪŋk/',
    phoneticB: '/sɪŋk/',
    meaningUzA: 'Oʻylamoq',
    meaningUzB: 'Choʻkmoq / Chanoq',
    tipUz: '/θ/ tovushida til uchi tishlar orasiga qoʻyilib havo chiqariladi. /s/ da til tishlar orqasida boʻladi.',
  },
  {
    id: 'mp-4',
    category: 'Consonants: Voiced /ð/ vs /z/',
    soundA: '/ð/',
    soundB: '/z/',
    wordA: 'Breathe',
    wordB: 'Breeze',
    phoneticA: '/briːð/',
    phoneticB: '/briːz/',
    meaningUzA: 'Nafas olmoq',
    meaningUzB: 'Mayin shabada',
    tipUz: '/ð/ da til tishlar orasida titraydi (ovozli). /z/ da tishlar bir-biriga yaqinlashadi.',
  },
  {
    id: 'mp-5',
    category: 'Vowels: Open /æ/ vs Mid /e/',
    soundA: '/æ/',
    soundB: '/e/',
    wordA: 'Bad',
    wordB: 'Bed',
    phoneticA: '/bæd/',
    phoneticB: '/bed/',
    meaningUzA: 'Yomon',
    meaningUzB: 'Karavot',
    tipUz: '/æ/ aytganda jagʻ pastga keng ochiladi. /e/ da esa ogʻiz yarim ochiq boʻladi.',
  },
  {
    id: 'mp-6',
    category: 'Consonants: /f/ vs /v/',
    soundA: '/f/',
    soundB: '/v/',
    wordA: 'Fan',
    wordB: 'Van',
    phoneticA: '/fæn/',
    phoneticB: '/væn/',
    meaningUzA: 'Ventilyator / Muxlis',
    meaningUzB: 'Furgon mashina',
    tipUz: '/f/ ovozsiz — faqat havo chiqadi. /v/ da ovoz paychalari titraydi (tomoqni ushlab koʻring).',
  },
  {
    id: 'mp-7',
    category: 'Difficult Endings: /wɜːld/ vs /wɜːd/',
    soundA: '/wɜːld/',
    soundB: '/wɜːd/',
    wordA: 'World',
    wordB: 'Word',
    phoneticA: '/wɜːld/',
    phoneticB: '/wɜːd/',
    meaningUzA: 'Dunyo',
    meaningUzB: 'Soʻz',
    tipUz: 'World soʻzida "r" dan soʻng til orqaga tortilib yumshoq "l" qoʻshiladi va "d" bilan tugaydi.',
  },
];

export const PronunciationTab: React.FC = () => {
  const [activePair, setActivePair] = useState<MinimalPair>(MINIMAL_PAIRS[0]);
  const [testingWord, setTestingWord] = useState<'A' | 'B'>('A');
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPairs = MINIMAL_PAIRS.filter(
    (p) =>
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wordA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wordB.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playWord = (word: string, slow = false) => {
    setIsPlayingAudio(true);
    ttsService.speak(word, {
      rate: slow ? 0.65 : 0.95,
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleTestPronunciation = (target: 'A' | 'B') => {
    setTestingWord(target);
    setRecognizedText('');
    setPronunciationScore(null);
    setIsRecording(true);

    const targetWord = target === 'A' ? activePair.wordA : activePair.wordB;

    const unsub = speechRecognitionService.onResult((transcript: string) => {
      setRecognizedText(transcript);
      evaluatePronunciation(transcript, targetWord);
      setIsRecording(false);
      speechRecognitionService.stopListening();
      unsub();
    });

    speechRecognitionService.startListening();
  };

  const evaluatePronunciation = (userSpeech: string, targetWord: string) => {
    const cleanSpeech = userSpeech.trim().toLowerCase();
    const cleanTarget = targetWord.trim().toLowerCase();

    if (cleanSpeech.includes(cleanTarget)) {
      setPronunciationScore(95);
    } else {
      // Check phonetic distance or letter match
      let matches = 0;
      for (let i = 0; i < Math.min(cleanSpeech.length, cleanTarget.length); i++) {
        if (cleanSpeech[i] === cleanTarget[i]) matches++;
      }
      const score = Math.max(50, Math.round((matches / cleanTarget.length) * 85));
      setPronunciationScore(score);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Phonetics & Minimal Pairs
            </span>
            <span className="text-xs text-slate-400">IPA Transcription & Acoustic Check</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Pronunciation Lab</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Ingliz tilidagi oʻxshash va chalgʻituvchi tovushlarni aniq talaffuz qilishni oʻrganing
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sound or word..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Minimal Pairs List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Sound Pairs ({filteredPairs.length})
          </div>
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredPairs.map((pair) => {
              const isSelected = activePair.id === pair.id;
              return (
                <div
                  key={pair.id}
                  onClick={() => {
                    setActivePair(pair);
                    setPronunciationScore(null);
                    setRecognizedText('');
                  }}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1.5 font-medium">{pair.category}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-slate-100">{pair.wordA}</span>
                      <span className="text-xs text-slate-500 font-mono">vs</span>
                      <span className="text-base font-bold text-slate-100">{pair.wordB}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                      <span>{pair.soundA}</span>
                      <span>•</span>
                      <span>{pair.soundB}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Pair Practice Workbench */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                {activePair.category}
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                {activePair.wordA} vs {activePair.wordB}
              </h3>
            </div>

            {/* Side by side comparison cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Word A */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400">
                      {activePair.soundA}
                    </span>
                    <span className="text-xs text-slate-400">Word A</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{activePair.wordA}</div>
                  <div className="text-sm font-mono text-emerald-400 mt-0.5">{activePair.phoneticA}</div>
                  <div className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg">
                    🇺🇿 {activePair.meaningUzA}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => playWord(activePair.wordA, false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Normal
                    </button>
                    <button
                      onClick={() => playWord(activePair.wordA, true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Slow 0.7x
                    </button>
                  </div>

                  <button
                    onClick={() => handleTestPronunciation('A')}
                    disabled={isRecording}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isRecording && testingWord === 'A'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording && testingWord === 'A' ? 'Listening...' : `Record "${activePair.wordA}"`}
                  </button>
                </div>
              </div>

              {/* Word B */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-400">
                      {activePair.soundB}
                    </span>
                    <span className="text-xs text-slate-400">Word B</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{activePair.wordB}</div>
                  <div className="text-sm font-mono text-emerald-400 mt-0.5">{activePair.phoneticB}</div>
                  <div className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg">
                    🇺🇿 {activePair.meaningUzB}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => playWord(activePair.wordB, false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Normal
                    </button>
                    <button
                      onClick={() => playWord(activePair.wordB, true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Slow 0.7x
                    </button>
                  </div>

                  <button
                    onClick={() => handleTestPronunciation('B')}
                    disabled={isRecording}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isRecording && testingWord === 'B'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording && testingWord === 'B' ? 'Listening...' : `Record "${activePair.wordB}"`}
                  </button>
                </div>
              </div>
            </div>

            {/* Articulation & Tongue Tip Guide */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <Zap className="w-4 h-4" />
                Talaffuz siri va ogʻiz holati (Articulation Guide)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activePair.tipUz}</p>
            </div>

            {/* Test Result Evaluation Box */}
            {pronunciationScore !== null && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  pronunciationScore >= 80
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {pronunciationScore >= 80 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-sm">
                      {pronunciationScore >= 80 ? 'Ajoyib talaffuz!' : 'Mashq qilish kerak'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Heard: <span className="font-mono font-medium">"{recognizedText || '...'}"</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">{pronunciationScore}%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Acoustic Match</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
