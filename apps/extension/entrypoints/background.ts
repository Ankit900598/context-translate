import {
  MemoryCacheStore,
  translateText,
  TranslateError,
} from "@context-translate/core";
import { getSettings } from "../utils/storage";

const MENU_ID = "context-translate-selection";
const cache = new MemoryCacheStore();

function registerContextMenu(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Translate selection",
      contexts: ["selection"],
    });
  });
}

export default defineBackground(() => {
  registerContextMenu();

  chrome.runtime.onInstalled.addListener((details) => {
    registerContextMenu();

    // Demo mode is default — no options page on install (avoids API-key setup feel).
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID || !tab?.id) return;

    const selectedText = info.selectionText?.trim();
    if (!selectedText) return;

    try {
      const settings = await getSettings();
      const result = await translateText(
        {
          text: selectedText,
          targetLanguage: settings.targetLanguage,
          sourceLanguage: settings.sourceLanguage,
          googleApiKey: settings.googleApiKey,
          translateMode: settings.translateMode,
        },
        cache,
      );

      await sendTranslationToTab(tab.id, {
        original: selectedText,
        translated: result.translatedText,
        targetLanguage: result.targetLanguage,
        cached: result.cached,
        mock: result.mock,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof TranslateError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Translation failed";

      await sendTranslationToTab(tab.id, {
        original: selectedText,
        translated: "",
        targetLanguage: "",
        cached: false,
        mock: false,
        error: message,
      });
    }
  });
});

type TranslationMessage = {
  original: string;
  translated: string;
  targetLanguage: string;
  cached: boolean;
  mock: boolean;
  error: string | null;
};

async function sendTranslationToTab(
  tabId: number,
  payload: TranslationMessage,
): Promise<void> {
  const message = { type: "SHOW_TRANSLATION", payload };
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return;
  } catch {
    // Tab may not have content script yet (e.g. just opened). Inject once and retry.
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["content-scripts/content.css"],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-scripts/content.js"],
    });
    await chrome.tabs.sendMessage(tabId, message);
  }
}
