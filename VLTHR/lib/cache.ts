type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export const cacheManager = {
  set: <T>(key: string, data: T, ttl: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`vlthr_cache_${key}`, JSON.stringify(entry));
  },

  get: <T>(key: string): { data: T | null; isStale: boolean } => {
    const raw = localStorage.getItem(`vlthr_cache_${key}`);
    if (!raw) return { data: null, isStale: true };

    try {
      const entry: CacheEntry<T> = JSON.parse(raw);
      const age = Date.now() - entry.timestamp;
      const isStale = age > entry.ttl;

      return { data: entry.data, isStale };
    } catch (e) {
      return { data: null, isStale: true };
    }
  },

  clear: (key: string) => {
    localStorage.removeItem(`althr_cache_${key}`);
  }
};
