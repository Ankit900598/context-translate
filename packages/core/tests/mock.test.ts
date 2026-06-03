import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockTranslate } from "../src/mock.js";

describe("mockTranslate", () => {
  it("returns demo output without network", () => {
    const result = mockTranslate("hello world", "hi");
    assert.ok(
      result.translatedText.includes("नमस्ते") ||
        result.translatedText.includes("डेमो"),
    );
    assert.equal(typeof result.detectedSourceLanguage, "string");
  });

  it("never returns empty", () => {
    const result = mockTranslate("xyz unknown word", "en");
    assert.ok(result.translatedText.length > 10);
  });
});
