const cache = new Map();

module.exports = {
  set: (key, data, ttl) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },

  get: (key) => {
    const entry = cache.get(key);
    if (!entry) return { data: null, isStale: true };

    const isStale = (Date.now() - entry.timestamp) > entry.ttl;
    return { data: entry.data, isStale };
  },

  clear: (key) => cache.delete(key)
};
