import { DEFAULT_SETTINGS, type AppSettings } from "@context-translate/core";

const KEY = "context-translate-settings";

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(KEY);
  const parsed = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};

  return {
    targetLanguage: parsed.targetLanguage ?? DEFAULT_SETTINGS.targetLanguage,
    sourceLanguage: parsed.sourceLanguage ?? DEFAULT_SETTINGS.sourceLanguage,
    googleApiKey: parsed.googleApiKey ?? DEFAULT_SETTINGS.googleApiKey,
    translateMode: parsed.translateMode ?? DEFAULT_SETTINGS.translateMode,
  };
}

export function saveSettings(partial: Partial<AppSettings>): void {
  const current = loadSettings();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }));
}
