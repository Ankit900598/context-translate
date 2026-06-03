import type { CacheStore } from "./types.js";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

export class MemoryCacheStore implements CacheStore {
  private store = new Map<string, MemoryEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(
    key: string,
    value: string,
    ttlMs: number = DEFAULT_TTL_MS,
  ): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export function buildCacheKey(
  text: string,
  targetLanguage: string,
  sourceLanguage: string,
): string {
  const normalized = text.trim().toLowerCase();
  return `${sourceLanguage}:${targetLanguage}:${normalized}`;
}
