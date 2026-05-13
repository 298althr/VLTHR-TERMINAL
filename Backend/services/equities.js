const axios = require('axios');
const cache = require('../lib/cache');
const rateLimit = require('../lib/rateLimit');
const config = require('../lib/config');

const TWELVE_DATA_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_KEY;
const FMP_KEY = process.env.NEXT_PUBLIC_FMP_KEY;

module.exports = {
  getPrice: async (symbol) => {
    const cacheKey = `equity_price_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    if (TWELVE_DATA_KEY && TWELVE_DATA_KEY !== 'your_twelve_data_key_here') {
      if (rateLimit.increment('TWELVE_DATA', config.RATE_LIMITS.TWELVE_DATA)) {
        try {
          const res = await axios.get(`https://api.twelvedata.com/quote`, {
            params: { symbol, apikey: TWELVE_DATA_KEY }
          });
          if (res.data.status === 'error') return null;

          const normalized = {
            symbol: res.data.symbol,
            name: res.data.name,
            price: parseFloat(res.data.close),
            change: parseFloat(res.data.change),
            changePct: parseFloat(res.data.percent_change),
            volume: parseInt(res.data.volume),
            high: parseFloat(res.data.high),
            low: parseFloat(res.data.low),
            open: parseFloat(res.data.open),
            close: parseFloat(res.data.close),
            timestamp: res.data.timestamp * 1000,
            source: 'Twelve Data'
          };
          cache.set(cacheKey, normalized, config.CACHE_TTLS.STOCK_PRICE);
          return normalized;
        } catch (e) {}
      }
    }
    return cached.data;
  },

  getHistory: async (symbol, interval = '1day') => {
    const cacheKey = `equity_history_${symbol}_${interval}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    if (TWELVE_DATA_KEY && TWELVE_DATA_KEY !== 'your_twelve_data_key_here') {
      if (rateLimit.increment('TWELVE_DATA', config.RATE_LIMITS.TWELVE_DATA)) {
        try {
          const res = await axios.get(`https://api.twelvedata.com/time_series`, {
            params: { symbol, interval, apikey: TWELVE_DATA_KEY }
          });
          const points = res.data.values.map(v => ({
            t: new Date(v.datetime).getTime(),
            o: parseFloat(v.open),
            h: parseFloat(v.high),
            l: parseFloat(v.low),
            c: parseFloat(v.close),
            v: parseInt(v.volume)
          }));
          const normalized = { symbol, interval, points };
          cache.set(cacheKey, normalized, config.CACHE_TTLS.STOCK_PRICE);
          return normalized;
        } catch (e) {}
      }
    }
    return cached.data;
  },

  getFundamentals: async (symbol) => {
    const cacheKey = `equity_fundamental_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    if (FMP_KEY && FMP_KEY !== 'your_fmp_key_here') {
      if (rateLimit.increment('FMP', config.RATE_LIMITS.FINANCIAL_MODELING_PREP)) {
        try {
          const res = await axios.get(`https://financialmodelingprep.com/api/v3/profile/${symbol}`, {
            params: { apikey: FMP_KEY }
          });
          const item = res.data[0];
          if (!item) return null;
          const normalized = {
            symbol: item.symbol,
            marketCap: item.mktCap,
            pe: 0,
            eps: 0,
            revenue: 0,
            debtToEquity: 0,
            dividendYield: item.lastDiv,
            sector: item.sector
          };
          cache.set(cacheKey, normalized, config.CACHE_TTLS.FUNDAMENTALS);
          return normalized;
        } catch (e) {}
      }
    }
    return cached.data;
  }
};
