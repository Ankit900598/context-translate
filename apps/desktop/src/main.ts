import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  MemoryCacheStore,
  POPULAR_LANGUAGES,
  translateText,
  TranslateError,
} from "@context-translate/core";
import { loadSettings, saveSettings } from "./storage";

const cache = new MemoryCacheStore();
const appEl = document.getElementById("app")!;
const settingsPanel = document.getElementById("settings-panel")!;
const translationEl = document.getElementById("translation")!;
const originalEl = document.getElementById("original")!;
const errorEl = document.getElementById("error")!;
const copyBtn = document.getElementById("copy-btn") as HTMLButtonElement;
const closeBtn = document.getElementById("close-btn")!;
const translateModeSelect = document.getElementById(
  "translate-mode",
) as HTMLSelectElement;
const googleApiKeyInput = document.getElementById(
  "google-api-key",
) as HTMLInputElement;
const targetSelect = document.getElementById(
  "target-language",
) as HTMLSelectElement;
const saveSettingsBtn = document.getElementById("save-settings")!;
const settingsStatus = document.getElementById("settings-status")!;

let lastTranslation = "";

function showResultView(): void {
  appEl.classList.remove("hidden");
  settingsPanel.classList.add("hidden");
}

function showSettingsView(): void {
  appEl.classList.add("hidden");
  settingsPanel.classList.remove("hidden");
  const settings = loadSettings();
  translateModeSelect.value = settings.translateMode;
  googleApiKeyInput.value = settings.googleApiKey;
  targetSelect.value = settings.targetLanguage;
}

function fillLanguages(): void {
  for (const lang of POPULAR_LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = lang.label;
    targetSelect.appendChild(opt);
  }
}

async function runTranslate(text: string): Promise<void> {
  const settings = loadSettings();
  errorEl.classList.add("hidden");
  showResultView();
  await getCurrentWindow().show();
  await getCurrentWindow().setFocus();

  originalEl.textContent =
    text.length > 280 ? `${text.slice(0, 280)}…` : text;

  try {
    const result = await translateText(
      {
        text,
        targetLanguage: settings.targetLanguage,
        sourceLanguage: settings.sourceLanguage,
        googleApiKey: settings.googleApiKey,
        translateMode: settings.translateMode,
      },
      cache,
    );
    lastTranslation = result.translatedText;
    translationEl.textContent = result.translatedText;
    if (result.mock) {
      translationEl.dataset.mock = "true";
    } else {
      delete translationEl.dataset.mock;
    }
  } catch (err) {
    lastTranslation = "";
    translationEl.textContent = "";
    const message =
      err instanceof TranslateError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Translation failed";
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

async function translateFromSelection(): Promise<void> {
  const text = await invoke<string>("grab_selected_text");
  if (!text?.trim()) {
    showResultView();
    errorEl.textContent =
      "No text captured. Select text, then press Ctrl+Shift+T.";
    errorEl.classList.remove("hidden");
    await getCurrentWindow().show();
    return;
  }
  await runTranslate(text);
}

async function translateFromClipboard(): Promise<void> {
  const text = await invoke<string>("read_clipboard_text");
  if (!text?.trim()) {
    showResultView();
    errorEl.textContent = "Clipboard is empty.";
    errorEl.classList.remove("hidden");
    await getCurrentWindow().show();
    return;
  }
  await runTranslate(text);
}

closeBtn.addEventListener("click", async () => {
  await getCurrentWindow().hide();
});

copyBtn.addEventListener("click", async () => {
  if (!lastTranslation) return;
  await invoke("write_clipboard_text", { text: lastTranslation });
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy translation";
  }, 1500);
});

saveSettingsBtn.addEventListener("click", () => {
  saveSettings({
    translateMode: translateModeSelect.value as "mock" | "google",
    googleApiKey: googleApiKeyInput.value.trim(),
    targetLanguage: targetSelect.value,
  });
  settingsStatus.classList.remove("hidden");
  setTimeout(() => settingsStatus.classList.add("hidden"), 2000);
});

fillLanguages();

listen("translate-selection", () => {
  void translateFromSelection();
});

listen("translate-clipboard", () => {
  void translateFromClipboard();
});

listen("open-settings", () => {
  showSettingsView();
  void getCurrentWindow().show();
  void getCurrentWindow().setFocus();
});

void getCurrentWindow().hide();
