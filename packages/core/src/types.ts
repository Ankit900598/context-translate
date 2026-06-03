export type TranslateMode = "mock" | "google";

export interface AppSettings {
  targetLanguage: string;
  sourceLanguage: string;
  googleApiKey: string;
  /** Default `mock` — works offline with no key (safe demo). */
  translateMode: TranslateMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  targetLanguage: "hi",
  sourceLanguage: "auto",
  googleApiKey: "",
  translateMode: "mock",
};

export interface TranslateInput {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  googleApiKey?: string;
  translateMode?: TranslateMode;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  targetLanguage: string;
  cached: boolean;
  /** True when demo/mock translation was used (no Google call). */
  mock: boolean;
}

export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
}

export class TranslateError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "EMPTY_TEXT"
      | "MISSING_CONFIG"
      | "RATE_LIMIT"
      | "API_ERROR"
      | "NETWORK",
  ) {
    super(message);
    this.name = "TranslateError";
  }
}
