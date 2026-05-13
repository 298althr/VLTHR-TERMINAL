const axios = require('axios');
const cache = require('../lib/cache');
const config = require('../lib/config');

const FRANKFURTER_BASE = 'https://api.frankfurter.app';

module.exports = {
  getLatestRates: async (base = 'USD', symbols = 'EUR,GBP,JPY,CHF,AUD,CAD,CNY,HKD') => {
    const cacheKey = 'forex_latest';
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    try {
      const res = await axios.get(`${FRANKFURTER_BASE}/latest`, { params: { from: base, to: symbols } });
      const normalized = Object.entries(res.data.rates).map(([symbol, price]) => ({
        symbol: `${base}/${symbol}`,
        name: `${base} to ${symbol}`,
        price: price,
        change: 0,
        changePct: 0,
        volume: 0,
        high: price,
        low: price,
        open: price,
        close: price,
        timestamp: Date.now(),
        source: 'Frankfurter'
      }));

      cache.set(cacheKey, normalized, config.CACHE_TTLS.FOREX_RATE);
      return normalized;
    } catch (error) {
      console.error('Forex Service Error:', error.message);
      return cached.data || [];
    }
  },

  getHistory: async (base = 'USD', quote = 'EUR', days = 30) => {
    const cacheKey = `forex_history_${base}_${quote}_${days}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    try {
      const start = new Date();
      start.setDate(start.getDate() - days);
      const startStr = start.toISOString().split('T')[0];

      const res = await axios.get(`${FRANKFURTER_BASE}/${startStr}..`, { params: { from: base, to: quote } });
      const points = Object.entries(res.data.rates).map(([date, rates]) => ({
        t: new Date(date).getTime(),
        o: rates[quote],
        h: rates[quote],
        l: rates[quote],
        c: rates[quote],
        v: 0
      }));

      const normalized = { symbol: `${base}/${quote}`, interval: 'daily', points };
      cache.set(cacheKey, normalized, config.CACHE_TTLS.FOREX_RATE);
      return normalized;
    } catch (error) {
      console.error('Forex History Service Error:', error.message);
      return cached.data || null;
    }
  }
};
