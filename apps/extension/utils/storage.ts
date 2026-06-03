import { DEFAULT_SETTINGS, type AppSettings } from "@context-translate/core";

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<AppSettings> {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const raw = stored[SETTINGS_KEY] as Partial<AppSettings> | undefined;

  return {
    targetLanguage: raw?.targetLanguage ?? DEFAULT_SETTINGS.targetLanguage,
    sourceLanguage: raw?.sourceLanguage ?? DEFAULT_SETTINGS.sourceLanguage,
    googleApiKey: raw?.googleApiKey ?? DEFAULT_SETTINGS.googleApiKey,
    translateMode: raw?.translateMode ?? DEFAULT_SETTINGS.translateMode,
  };
}

export async function saveSettings(
  settings: Partial<AppSettings>,
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    [SETTINGS_KEY]: { ...current, ...settings },
  });
}
