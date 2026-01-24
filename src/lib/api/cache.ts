/** In-memory cache for API responses */

import crypto from 'crypto';
import { getLogger } from './logger';

const log = getLogger('API:Cache');

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
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  get<T>(data: unknown): T | null {
    const enableCaching = process.env.ENABLE_CACHING === 'true';

    if (!enableCaching) {
      log.debug('Cache disabled via ENABLE_CACHING environment variable');
      return null;
    }

    const key = this.generateKey(data);
    const entry = this.cache.get(key);

    if (!entry) {
      log.debug({ key: key.substring(0, 8) }, 'Cache miss');
      return null;
    }

    if (this.isExpired(entry)) {
      log.debug({ key: key.substring(0, 8) }, 'Cache entry expired');
      this.cache.delete(key);
      return null;
    }

    log.debug({ key: key.substring(0, 8) }, 'Cache hit');
    return entry.data as T;
  }

  set<T>(data: unknown, value: T, ttl: number = this.defaultTTL): void {
    const enableCaching = process.env.ENABLE_CACHING === 'true';

    if (!enableCaching) {
      log.debug('Cache disabled via ENABLE_CACHING environment variable');
      return;
    }

    const key = this.generateKey(data);
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
    log.debug({ key: key.substring(0, 8), ttlMs: ttl }, 'Cache entry stored');
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    log.info({ clearedEntries: size }, 'Cache cleared');
  }

  size(): number {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache();
