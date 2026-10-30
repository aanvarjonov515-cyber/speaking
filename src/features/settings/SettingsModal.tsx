import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  User,
  Sliders,
  Palette,
  Volume2,
  Trash2,
  Check,
  Plus,
  RefreshCw,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';
import { APIKeyConfig, AppSettings, CorrectionStyle, TeacherPersonality } from '../../types';
import { DBService } from '../../services/database/dbService';
import { aiService } from '../../services/ai/aiService';
import { ttsService } from '../../services/tts/ttsService';
import { globalTeacherManager } from '../../services/teacher/globalTeacherManager';
import { VoiceRegistryService } from '../../services/voice/voiceRegistry';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onVrmUploaded: (fileUrl: string, fileName: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onVrmUploaded,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'teacher' | 'reading' | 'appearance' | 'data'>('ai');
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newProvider, setNewProvider] = useState<'gemini' | 'openai'>('gemini');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState(globalTeacherManager.getProfile());
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKeys(DBService.getAPIKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Mask key: "AIza•••••••••x92K"
  const maskKey = (k: string) => {
    if (!k || k.length < 8) return '••••••••';
    return `${k.slice(0, 4)}•••••••••${k.slice(-4)}`;
  };

  const handleAddKey = () => {
    if (!newKey.trim()) {
      setKeyError('API kalitni kiriting');
      return;
    }
    try {
      const updated = DBService.addAPIKey(newKey.trim(), newProvider, newKeyName.trim() || undefined);
      setApiKeys(updated);
      setNewKey('');
      setNewKeyName('');
      setKeyError(null);
    } catch (err: any) {
      setKeyError(err?.message || 'Kalit qoʻshib boʻlmadi');
    }
  };

  const handleToggleKeyStatus = (id: string) => {
    const updated = apiKeys.map((k) => {
      if (k.id === id) {
        const nextStatus = k.status === 'disabled' ? ('ready' as const) : ('disabled' as const);
        return {
          ...k,
          status: nextStatus,
        };
      }
      return k;
    });
    DBService.saveAPIKeys(updated);
    setApiKeys(updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = apiKeys.map((k) => ({
      ...k,
      status: k.id === id ? ('active' as const) : k.status === 'active' ? ('ready' as const) : k.status,
    }));
    DBService.saveAPIKeys(updated);
    setApiKeys(updated);
  };

  const handleDeleteKey = (id: string) => {
    const updated = apiKeys.filter((k) => k.id !== id);
    if (updated.length > 0 && !updated.some((k) => k.status === 'active')) {
      updated[0].status = 'active';
    }
    DBService.saveAPIKeys(updated);
    setApiKeys(updated);
  };

  const handleTestKey = async (config: APIKeyConfig) => {
    setTestingId(config.id);
    setTestResult(null);
    try {
      const res = await aiService.testConnection(config.key, config.provider);
      setTestResult({
        id: config.id,
        success: res.success,
        msg: res.message || 'Connected successfully',
      });
    } catch (err: any) {
      setTestResult({
        id: config.id,
        success: false,
        msg: err?.message || 'Connection failed',
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleVRMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.vrm')) {
      alert('Iltimos, haqiqiy .vrm kengaytmali 3D model yuklang.');
      return;
    }

    const url = URL.createObjectURL(file);
    onVrmUploaded(url, file.name);
  };

  const handleResetVRM = () => {
    onUpdateSettings({ vrmModelUrl: null, vrmModelName: undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col h-[82vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">Dastur Sozlamalari (Settings)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 shrink-0 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI Providers (Multi-Key)</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'teacher'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Teacher & VRM</span>
          </button>

          <button
            onClick={() => setActiveTab('reading')}
            className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'reading'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Reading & Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* TAB 1: AI Providers & Failover */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/60 space-y-1">
                <span className="font-semibold text-indigo-300">
                  Avtomatik Failover & 10 Tagacha API Kalit
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Agar asosiy AI kalitingiz limiti (quota) tugasa yoki band boʻlsa, dastur avtomatik ravishda
                  keyingi faol kalitga uzluksiz oʻtadi. Kalitlar desktop xotirasida xavfsiz shifrlanadi.
                </p>
              </div>

              {/* Add Key Form */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <h3 className="font-semibold text-slate-200 text-xs">Yangi API Kalit Qoʻshish</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Kalit nomi (masalan: Gemini Pro 2)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                  </select>
                  <input
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter API Key..."
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {keyError && <p className="text-rose-400 text-[11px]">{keyError}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleAddKey}
                    disabled={apiKeys.length >= 10}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kalitni saqlash ({apiKeys.length}/10)</span>
                  </button>
                </div>
              </div>

              {/* Key List */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-300 text-xs">Mavjud Kalitlar Roʻyxati</h3>
                {apiKeys.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">
                    Hozircha hech qanday API kalit kiritilmagan.
                  </p>
                ) : (
                  apiKeys.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{item.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-400 font-mono text-[10px] uppercase">
                            {item.provider}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : item.status === 'ready'
                                ? 'bg-slate-900 text-slate-300 border border-slate-700'
                                : item.status === 'rate_limited'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="font-mono text-slate-400 text-[11px]">
                          {maskKey(item.key)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status !== 'active' && item.status !== 'disabled' && (
                          <button
                            onClick={() => handleSetPrimary(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px]"
                          >
                            Asosiy qilish
                          </button>
                        )}

                        <button
                          onClick={() => handleTestKey(item)}
                          disabled={testingId === item.id}
                          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] flex items-center gap-1"
                        >
                          {testingId === item.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => handleToggleKeyStatus(item.id)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px]"
                        >
                          {item.status === 'disabled' ? 'Yoqish' : 'Oʻchirish'}
                        </button>

                        <button
                          onClick={() => handleDeleteKey(item.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                        : 'bg-rose-950/80 border-rose-800 text-rose-200'
                    }`}
                  >
                    {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Teacher & VRM */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              {/* Teacher Identity & Personality */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200 text-xs">Oʻqituvchi Shaxsi va Xarakteri (Teacher Profile)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                    Global Teacher Singleton
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Oʻqituvchi Ismi</label>
                    <input
                      type="text"
                      value={teacherProfile.name}
                      onChange={(e) => {
                        const updated = globalTeacherManager.updateProfile({ name: e.target.value });
                        setTeacherProfile(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">Muloqot Usuli (Personality)</label>
                    <select
                      value={teacherProfile.personality}
                      onChange={(e) => {
                        const updated = globalTeacherManager.updateProfile({
                          personality: e.target.value as TeacherPersonality,
                        });
                        setTeacherProfile(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="Friendly">Friendly (Doʻstona va dildan qoʻllab-quvvatlovchi)</option>
                      <option value="Calm">Calm (Vazmin va xotirjam tushuntiruvchi)</option>
                      <option value="Professional">Professional (Akademik va biznesga yoʻnaltirilgan)</option>
                      <option value="Energetic">Energetic (Yuqori motivatsiyali va shijoatli)</option>
                      <option value="Patient">Patient (Sabrli, takrorlashdan erinmaydigan)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Xatolarni Tuzatish Uslubi (Correction Style)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Gentle', label: 'Gentle', desc: 'Faqat jiddiy xatolar' },
                      { id: 'Balanced', label: 'Balanced', desc: 'Meʼyoriy tuzatish' },
                      { id: 'Strict', label: 'Strict', desc: 'Har bir grammatik detal' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const updated = globalTeacherManager.updateProfile({
                            correctionStyle: item.id as CorrectionStyle,
                          });
                          setTeacherProfile(updated);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          teacherProfile.correctionStyle === item.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-xs text-slate-200">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Professional Voice Registry (10 Natural Uzbek Voices + English Pairs) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-200 text-xs">Tabiiy Ovozlar Reyestri (Voice Registry)</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      10 ta haqiqiy oʻzbek ovozlari (5 ayol + 5 erkak) va ingliz tili juftliklari
                    </p>
                  </div>

                  {/* Gender Filter Buttons */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                    {(['all', 'female', 'male'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setVoiceGenderFilter(g)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition cursor-pointer ${
                          voiceGenderFilter === g
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {g === 'all' ? 'Barchasi (10)' : g === 'female' ? 'Ayol (5)' : 'Erkak (5)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {VoiceRegistryService.getAllUzbekVoices()
                    .filter((v) => (voiceGenderFilter === 'all' ? true : v.gender === voiceGenderFilter))
                    .map((voice) => {
                      const isSelected = teacherProfile.preferredUzbekVoiceId === voice.id;
                      const isPreviewing = previewingVoiceId === voice.id;

                      return (
                        <div
                          key={voice.id}
                          className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100 text-xs">{voice.displayName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {voice.region}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  voice.quality === 'ultra_hd'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                              >
                                {voice.quality === 'ultra_hd' ? 'Ultra HD' : 'Natural'}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {voice.descriptionUz}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setPreviewingVoiceId(voice.id);
                                VoiceRegistryService.playPreview(voice.id, 'uz', () => setPreviewingVoiceId(null));
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                                isPreviewing
                                  ? 'bg-indigo-600 text-white animate-pulse'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              {isPreviewing ? 'Tinglanmoqda...' : 'Namuna'}
                            </button>

                            <button
                              onClick={() => {
                                const updated = globalTeacherManager.updateProfile({
                                  preferredUzbekVoiceId: voice.id,
                                });
                                setTeacherProfile(updated);
                                onUpdateSettings({ teacherVoice: voice.id });
                              }}
                              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {isSelected ? '✓ Tanlangan' : 'Ovozni tanlash'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* VRM 3D Model Uploader */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <h3 className="font-semibold text-slate-200">VRM 3D Model Sozlamalari</h3>
                <p className="text-slate-400 text-[11px]">
                  Oʻzingizning shaxsiy 3D avatar `.vrm` faylingizni yuklang yoki standart humanoid oʻqituvchidan foydalaning.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Load VRM Model (.vrm)</span>
                    <input
                      type="file"
                      accept=".vrm"
                      onChange={handleVRMUpload}
                      className="hidden"
                    />
                  </label>

                  {settings.vrmModelUrl && (
                    <button
                      onClick={handleResetVRM}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                    >
                      Standart modelga qaytish
                    </button>
                  )}
                </div>

                {settings.vrmModelName && (
                  <div className="text-emerald-400 font-mono text-[11px]">
                    Faol VRM: {settings.vrmModelName}
                  </div>
                )}
              </div>

              {/* Animation toggles */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-200">Animatsiyalar va Harakat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
                    <div>
                      <span className="font-medium text-slate-200">Real-time Lip-Sync</span>
                      <p className="text-[11px] text-slate-400">Ovoz bilan lab harakati sinxronlashuvi</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableLipSync}
                      onChange={(e) => onUpdateSettings({ enableLipSync: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer">
                    <div>
                      <span className="font-medium text-slate-200">Nafas olish & Pirpirash</span>
                      <p className="text-[11px] text-slate-400">Jonli tabiiy harakatlar</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableBreathing}
                      onChange={(e) => onUpdateSettings({ enableBreathing: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Reading & Voice */}
          {activeTab === 'reading' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="font-medium text-slate-300">Yordam tili (Assistance Language)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ assistanceLanguage: 'uz' })}
                    className={`p-3 rounded-xl font-medium text-center border transition-all ${
                      settings.assistanceLanguage === 'uz'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    Oʻzbekcha (Default)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ assistanceLanguage: 'en' })}
                    className={`p-3 rounded-xl font-medium text-center border transition-all ${
                      settings.assistanceLanguage === 'en'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    English Only
                  </button>
                </div>
              </div>

              {/* Voice Speed */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium text-slate-300">Oʻqish tezligi (Reading Speed)</label>
                  <span className="font-mono text-indigo-400">{settings.voiceSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.25"
                  value={settings.voiceSpeed}
                  onChange={(e) => onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Reading Font */}
              <div className="space-y-2">
                <label className="font-medium text-slate-300">Matn shrifti (Typography)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ readingFontFamily: 'sans' })}
                    className={`p-3 rounded-xl font-medium text-center border font-sans ${
                      settings.readingFontFamily === 'sans'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    Plus Jakarta Sans (Modern)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ readingFontFamily: 'serif' })}
                    className={`p-3 rounded-xl font-medium text-center border font-serif ${
                      settings.readingFontFamily === 'serif'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    Source Serif 4 (Book Editorial)
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium text-slate-300">Shrift oʻlchami</label>
                  <span className="font-mono text-indigo-400">{settings.readingFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="26"
                  step="1"
                  value={settings.readingFontSize}
                  onChange={(e) => onUpdateSettings({ readingFontSize: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="font-medium text-slate-300">Mavzu (Theme)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-3 rounded-xl font-medium text-center border transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    Dark Desktop Theme
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-3 rounded-xl font-medium text-center border transition-all ${
                      settings.theme === 'light'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    Light Theme
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-200">Reading Focus Mode</span>
                  <p className="text-[11px] text-slate-400">
                    Oʻqish paytida barcha ortiqcha panellarni yashirib, faqat matn va oʻqituvchini qoldiradi
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.focusMode}
                  onChange={(e) => onUpdateSettings({ focusMode: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Yopish va Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};
