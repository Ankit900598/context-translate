/**
 * Server-side Google Cloud Translation API v2 client.
 * API key must only live on the backend, never in extension/desktop builds.
 */

export interface GoogleTranslateResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export async function googleTranslate(
  apiKey: string,
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<GoogleTranslateResult> {
  const url = new URL(
    "https://translation.googleapis.com/language/translate/v2",
  );
  url.searchParams.set("key", apiKey);

  const body: Record<string, string> = {
    q: text,
    target: targetLanguage,
    format: "text",
  };
  if (sourceLanguage && sourceLanguage !== "auto") {
    body.source = sourceLanguage;
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    data?: {
      translations?: Array<{
        translatedText: string;
        detectedSourceLanguage?: string;
      }>;
    };
    error?: { message?: string; code?: number; status?: string };
  };

  if (!response.ok) {
    const msg =
      payload.error?.message ??
      `Google Translate failed (${response.status})`;
    throw new Error(msg);
  }

  const translation = payload.data?.translations?.[0];
  if (!translation?.translatedText) {
    throw new Error("No translation returned from Google");
  }

  return {
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage,
  };
}
