/**
 * Optional hosted API client (future Pro / team deployments).
 * v1 extension and desktop use `translateText` + local Google API key instead.
 */

import { buildCacheKey } from "./cache.js";
import type { CacheStore, TranslateResponse } from "./types.js";
import { TranslateError } from "./types.js";

export interface BackendTranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  deviceId: string;
}

export async function translateViaBackend(
  apiBaseUrl: string,
  request: BackendTranslateRequest,
  cache?: CacheStore,
): Promise<TranslateResponse> {
  const text = request.text?.trim();
  if (!text) {
    throw new TranslateError("No text selected to translate", "EMPTY_TEXT");
  }
  if (!apiBaseUrl?.trim()) {
    throw new TranslateError(
      "API server URL is not configured",
      "MISSING_CONFIG",
    );
  }
  if (!request.deviceId?.trim()) {
    throw new TranslateError("Device ID is missing", "MISSING_CONFIG");
  }

  const sourceLanguage = request.sourceLanguage ?? "auto";
  const cacheKey = buildCacheKey(text, request.targetLanguage, sourceLanguage);

  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return {
        translatedText: cached,
        targetLanguage: request.targetLanguage,
        cached: true,
        mock: false,
      };
    }
  }

  const base = apiBaseUrl.replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${base}/v1/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": request.deviceId,
      },
      body: JSON.stringify({
        text,
        targetLanguage: request.targetLanguage,
        sourceLanguage,
      }),
    });
  } catch {
    throw new TranslateError(
      "Cannot reach translation server. Is the API running?",
      "NETWORK",
    );
  }

  const payload = (await response.json()) as {
    translatedText?: string;
    detectedSourceLanguage?: string;
    targetLanguage?: string;
    error?: string;
  };

  if (response.status === 429) {
    throw new TranslateError(
      payload.error ?? "Daily translation limit reached. Try again tomorrow.",
      "RATE_LIMIT",
    );
  }

  if (!response.ok) {
    throw new TranslateError(
      payload.error ?? `Translation failed (${response.status})`,
      "API_ERROR",
    );
  }

  if (!payload.translatedText) {
    throw new TranslateError("Empty translation response", "API_ERROR");
  }

  if (cache) {
    await cache.set(cacheKey, payload.translatedText);
  }

  return {
    translatedText: payload.translatedText,
    detectedSourceLanguage: payload.detectedSourceLanguage,
    targetLanguage: payload.targetLanguage ?? request.targetLanguage,
    cached: false,
    mock: false,
  };
}

export function createDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
