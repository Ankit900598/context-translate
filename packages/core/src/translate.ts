import { buildCacheKey } from "./cache.js";
import { googleTranslate } from "./google.js";
import { mockTranslate } from "./mock.js";
import type { CacheStore, TranslateInput, TranslateResponse } from "./types.js";
import { TranslateError } from "./types.js";

function resolveMode(input: TranslateInput): "mock" | "google" {
  if (input.translateMode === "mock") return "mock";
  if (input.translateMode === "google") return "google";
  // No mode set: mock when no key, google when key present
  const key = input.googleApiKey?.trim();
  return key ? "google" : "mock";
}

/**
 * Local-first translation: mock demo by default, or direct Google when user supplies a key.
 */
export async function translateText(
  input: TranslateInput,
  cache?: CacheStore,
): Promise<TranslateResponse> {
  const text = input.text?.trim();
  if (!text) {
    throw new TranslateError("No text selected to translate", "EMPTY_TEXT");
  }

  const targetLanguage = input.targetLanguage?.trim() || "hi";
  const sourceLanguage = input.sourceLanguage ?? "auto";
  const mode = resolveMode(input);

  if (mode === "google" && !input.googleApiKey?.trim()) {
    throw new TranslateError(
      "Switch to Demo mode, or add your Google API key in Settings (Google mode only).",
      "MISSING_CONFIG",
    );
  }

  const cacheKey = buildCacheKey(
    text,
    targetLanguage,
    `${mode}:${sourceLanguage}`,
  );

  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return {
        translatedText: cached,
        targetLanguage,
        cached: true,
        mock: mode === "mock",
      };
    }
  }

  let translatedText: string;
  let detectedSourceLanguage: string | undefined;
  let mock = false;

  if (mode === "mock") {
    const result = mockTranslate(text, targetLanguage);
    translatedText = result.translatedText;
    detectedSourceLanguage = result.detectedSourceLanguage;
    mock = true;
  } else {
    try {
      const result = await googleTranslate(
        input.googleApiKey!.trim(),
        text,
        targetLanguage,
        sourceLanguage === "auto" ? undefined : sourceLanguage,
      );
      translatedText = result.translatedText;
      detectedSourceLanguage = result.detectedSourceLanguage;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Translation failed";
      if (
        message.toLowerCase().includes("fetch") ||
        message.toLowerCase().includes("network")
      ) {
        throw new TranslateError(message, "NETWORK");
      }
      throw new TranslateError(message, "API_ERROR");
    }
  }

  if (cache) {
    await cache.set(cacheKey, translatedText);
  }

  return {
    translatedText,
    detectedSourceLanguage,
    targetLanguage,
    cached: false,
    mock,
  };
}
