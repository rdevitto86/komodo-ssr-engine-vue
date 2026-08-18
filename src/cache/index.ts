export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
  lastModified: number;
  etag: string;
}

// TODO - eventually move these to the SDK

export class Cache<T> {
  private _cache: Map<string, CacheEntry<T>>;
  private _maxSize: number;
  private _ttl: number = 10 * 60 * 1000; // 10 minutes

  constructor(maxSize: number = 1000, ttl?: number) {
    this._cache = new Map();
    this._maxSize = maxSize;
    if (typeof ttl === 'number' && ttl > 0) this._ttl = ttl;
  }

  get size(): number { return this._cache.size; }
  get ttl(): number { return this._ttl; }

  get(key: string): T | null {
    const entry = this._cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (entry.expiresAt < now) {
      this._cache.delete(key);
      return null;
    }

    entry.lastAccessed = now;
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const etag = this.generateETag(value);

    if (this._cache.has(key)) this._cache.delete(key);

    if (this._cache.size >= this._maxSize) {
      let oldestKey: string | null = null;
      let oldestAccess = Infinity;

      for (const [k, v] of this._cache.entries()) {
        if (v.lastAccessed < oldestAccess) {
          oldestAccess = v.lastAccessed;
          oldestKey = k;
        }
      }
      if (oldestKey) this._cache.delete(oldestKey);
    }

    this._cache.set(key, {
      value,
      expiresAt: now + (ttl ?? this._ttl),
      lastAccessed: now,
      lastModified: now,
      etag,
    });
  }

  private generateETag(value: T): string {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    return Bun.hash(str).toString(16);
  }

  has(key: string): boolean {
    const entry = this._cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (entry.expiresAt < now) {
      this._cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean { return this._cache.delete(key); }

  clear(): void { this._cache.clear(); }

  cleanup(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this._cache.entries()) {
      if (entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => { this._cache.delete(key); });
    return keysToDelete.length;
  }

  getMetadata(key: string): { etag: string; lastModified: number } | null {
    const entry = this._cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (entry.expiresAt < now) {
      this._cache.delete(key);
      return null;
    }

    return {
      etag: entry.etag,
      lastModified: entry.lastModified,
    };
  }
}
