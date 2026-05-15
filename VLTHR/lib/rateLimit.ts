type RateStats = {
  count: number;
  lastReset: string; // ISO date
};

export const rateLimiter = {
  increment: (provider: string, limit: number): boolean => {
    const key = `vlthr_rate_${provider}`;
    const raw = localStorage.getItem(key);
    const today = new Date().toISOString().split('T')[0];

    let stats: RateStats = raw ? JSON.parse(raw) : { count: 0, lastReset: today };

    if (stats.lastReset !== today) {
      stats = { count: 0, lastReset: today };
    }

    if (stats.count >= limit) {
      console.warn(`VLTHRate limit reached for ${provider}: ${stats.count}/${limit}`);
      return false;
    }

    stats.count++;
    localStorage.setItem(key, JSON.stringify(stats));

    if (stats.count >= limit * 0.8) {
      console.warn(`Provider ${provider} is at ${Math.round((stats.count / limit) * 100)}% of daily budget.`);
    }

    return true;
  },

  getStats: (provider: string) => {
    const key = `vlthr_rate_${provider}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { count: 0, lastReset: new Date().toISOString().split('T')[0] };
  }
};
