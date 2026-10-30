/**
 * AI Service Configuration & Task Routing Tiers
 */

export const AI_MODELS = {
  FAST_MODEL: 'gemini-3.8-flash',
  QUALITY_MODEL: 'gemini-3.8-flash',
  LONG_CONTEXT_MODEL: 'gemini-3.8-flash',
};

export type KeyStatus =
  | 'active'
  | 'ready'
  | 'rate_limited'
  | 'quota_exhausted'
  | 'invalid'
  | 'disabled'
  | 'cooldown';

export interface ExtendedAPIKeyConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai';
  key: string;
  status: KeyStatus;
  order: number;
  failureCount: number;
  lastUsed?: number;
  cooldownUntil?: number; // Timestamp for rate-limit recovery
}

export type AIResponseMode = 'fast' | 'balanced' | 'deep';

export interface LatencyMetric {
  sttMs?: number;
  llmTtftMs?: number;
  llmTotalMs?: number;
  ttsMs?: number;
  totalTurnMs?: number;
}
