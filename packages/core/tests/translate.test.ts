import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MemoryCacheStore } from "../src/cache.js";
import { translateText } from "../src/translate.js";
import { TranslateError } from "../src/types.js";

describe("translateText", () => {
  it("uses mock mode by default without API key", async () => {
    const result = await translateText({
      text: "hello",
      targetLanguage: "hi",
      translateMode: "mock",
    });
    assert.equal(result.mock, true);
    assert.ok(result.translatedText.length > 0);
  });

  it("requires API key in google mode", async () => {
    await assert.rejects(
      async () => {
        await translateText({
          text: "hello",
          targetLanguage: "hi",
          translateMode: "google",
          googleApiKey: "",
        });
      },
      (err: unknown) =>
        err instanceof TranslateError && err.code === "MISSING_CONFIG",
    );
  });

  it("caches mock results", async () => {
    const cache = new MemoryCacheStore();
    await translateText(
      { text: "hello", targetLanguage: "hi", translateMode: "mock" },
      cache,
    );
    const second = await translateText(
      { text: "hello", targetLanguage: "hi", translateMode: "mock" },
      cache,
    );
    assert.equal(second.cached, true);
  });
});
