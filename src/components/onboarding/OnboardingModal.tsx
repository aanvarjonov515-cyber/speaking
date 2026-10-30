import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Key, Loader2, Bot, ShieldCheck } from 'lucide-react';
import { DBService } from '../../services/database/dbService';
import { aiService } from '../../services/ai/aiService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await aiService.testConnection(apiKey.trim(), provider);
      if (res.success) {
        setIsConnected(true);
        setStatusMsg({ success: true, text: 'Connected successfully' });
      } else {
        setIsConnected(false);
        setStatusMsg({ success: false, text: res.message || 'Connection failed' });
      }
    } catch (err: any) {
      setIsConnected(false);
      setStatusMsg({ success: false, text: err?.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleContinue = () => {
    if (apiKey.trim()) {
      DBService.addAPIKey(apiKey.trim(), provider, `${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} Primary`);
    }
    DBService.setOnboarded(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 p-8 space-y-6">
        {/* Brand Icon & Welcome Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome to English AI Teacher
          </h1>
          <p className="text-sm text-slate-400">
            Connect your AI provider to start learning.
          </p>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Choose AI Provider</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setProvider('gemini');
                setIsConnected(false);
                setStatusMsg(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                provider === 'gemini'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-xs">Google Gemini</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Flash 3.8 & Real-Time</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setProvider('openai');
                setIsConnected(false);
                setStatusMsg(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                provider === 'openai'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-xs">OpenAI</div>
              <div className="text-[11px] text-slate-400 mt-0.5">GPT-4o & Mini</div>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>API Key</span>
            <span className="text-[11px] text-slate-500 font-normal">Encrypted locally</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsConnected(false);
                setStatusMsg(null);
              }}
              placeholder="Enter API Key (AIzaSy...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <span>Test Connection</span>
            )}
          </button>
        </div>

        {/* Connection Status Badge */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-center gap-2 ${
              statusMsg.success
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/80 border-rose-800 text-rose-200'
            }`}
          >
            {statusMsg.success ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isConnected && !apiKey.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
