/**
 * Offline demo translations — no network, no API key, safe for first-run UX.
 */

const DEMO_HINT_EN = " (demo)";
const DEMO_HINT_HI = " (डेमो)";

export function mockTranslate(
  text: string,
  targetLanguage: string,
): { translatedText: string; detectedSourceLanguage: string } {
  const trimmed = text.trim();
  const hint = targetLanguage === "hi" ? DEMO_HINT_HI : DEMO_HINT_EN;

  // Tiny phrasebook for a believable demo without calling Google
  const phrasebook: Record<string, Record<string, string>> = {
    hello: { hi: "नमस्ते", en: "hello" },
    world: { hi: "दुनिया", en: "world" },
    thank: { hi: "धन्यवाद", en: "thank you" },
    you: { hi: "आप", en: "you" },
  };

  const lower = trimmed.toLowerCase();
  for (const [word, map] of Object.entries(phrasebook)) {
    if (lower.includes(word) && map[targetLanguage]) {
      return {
        translatedText: `${map[targetLanguage]}${hint}`,
        detectedSourceLanguage: targetLanguage === "hi" ? "en" : "hi",
      };
    }
  }

  const label = targetLanguage === "hi" ? "अनुवाद (डेमो)" : "Translation (demo)";
  return {
    translatedText: `[${label}] ${trimmed}${hint}`,
    detectedSourceLanguage: "en",
  };
}
