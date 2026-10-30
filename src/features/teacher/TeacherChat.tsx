import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, HelpCircle } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface TeacherChatProps {
  currentTextTitle: string;
  currentSentence?: string;
  selectedWord?: string;
  readingContext?: string;
  assistanceLanguage: 'uz' | 'en';
}

export const TeacherChat: React.FC<TeacherChatProps> = ({
  currentTextTitle,
  currentSentence,
  selectedWord,
  readingContext,
  assistanceLanguage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: assistanceLanguage === 'uz'
        ? `Salom! Men sizning AI oʻqituvchingizman. Matndagi istalgan soʻz yoki gap boʻyicha savol bering, birgalikda oʻrganamiz!`
        : `Hello! I am your English AI Teacher. Ask me anything about the text, grammar, or vocabulary!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({ role: m.role, text: m.text }));
      const reply = await aiService.askTeacher({
        question: textToSend,
        currentTextTitle,
        currentSentence,
        selectedWord,
        readingContext,
        lang: assistanceLanguage,
        history,
      });

      const aiMsg: Message = {
        id: 'reply_' + Date.now(),
        role: 'model',
        text: reply || 'Kechirasiz, qaytadan soʻrang.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'model',
          text: assistanceLanguage === 'uz'
            ? 'AI ulanishi vaqtinchalik mavjud emas. Iltimos, qayta urinib koʻring yoki Sozlamalardan API kalitini tekshiring.'
            : 'AI connection is currently unavailable. Please check settings or retry.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = assistanceLanguage === 'uz' ? [
    'Bu gap nimani anglatadi?',
    'Nega bu soʻz ishlatilgan?',
    'Osonroq sinonimi nima?',
    'Grammatikasini tushuntirib ber',
  ] : [
    'What does this sentence mean?',
    'Why is this word used here?',
    'What is a simpler synonym?',
    'Explain the grammar structure',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {assistanceLanguage === 'uz' ? 'Oʻqituvchi bilan Chat' : 'Teacher Chat'}
          </h3>
        </div>
        {selectedWord && (
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[140px]">
            "{selectedWord}"
          </span>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium ml-auto'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>
              {assistanceLanguage === 'uz' ? 'Oʻqituvchi oʻylamoqda...' : 'Teacher is thinking...'}
            </span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto border-t border-slate-800/60 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            assistanceLanguage === 'uz'
              ? selectedWord
                ? `"${selectedWord}" haqida soʻrang...`
                : 'Istalgan savol bering...'
              : selectedWord
              ? `Ask about "${selectedWord}"...`
              : 'Ask a question...'
          }
          className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
