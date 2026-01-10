/** In-memory cache for API responses */

import crypto from "crypto";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL = 60 * 60 * 1000; // 1 hour

  private generateKey(data: unknown): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash("sha256").update(jsonString).digest("hex");
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  get<T>(data: unknown): T | null {
    const key = this.generateKey(data);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(data: unknown, value: T, ttl: number = this.defaultTTL): void {
    const key = this.generateKey(data);
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache();
