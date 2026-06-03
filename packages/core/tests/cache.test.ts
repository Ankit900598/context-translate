import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCacheKey, MemoryCacheStore } from "../src/cache.js";

describe("buildCacheKey", () => {
  it("normalizes text case", () => {
    const a = buildCacheKey("Hello", "hi", "auto");
    const b = buildCacheKey("hello", "hi", "auto");
    assert.equal(a, b);
  });
});

describe("MemoryCacheStore", () => {
  it("stores and retrieves values", async () => {
    const cache = new MemoryCacheStore();
    await cache.set("k", "v", 60_000);
    assert.equal(await cache.get("k"), "v");
  });
});
