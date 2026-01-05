/**
 * Simple In-Memory Cache for API Responses
 * Caches results based on request hash to speed up repeated requests
 */

import crypto from "crypto";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ResponseCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL = 60 * 60 * 1000; // 1 hour default

  /**
   * Generate a hash key from data
   */
  private generateKey(data: unknown): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash("sha256").update(jsonString).digest("hex");
  }

  /**
   * Check if cache entry is still valid
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get cached value
   */
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

  /**
   * Set cached value
   */
  set<T>(data: unknown, value: T, ttl: number = this.defaultTTL): void {
    const key = this.generateKey(data);
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const responseCache = new ResponseCache();
