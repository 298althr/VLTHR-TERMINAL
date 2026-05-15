const axios = require('axios');
const cache = require('../lib/cache');
const config = require('../lib/config');
const quotaManager = require('../lib/quotaManager');
const parquetEngine = require('../lib/parquetEngine');
const snapshotParquet = require('../lib/snapshotParquet');

const FRANKFURTER_BASE = 'https://api.frankfurter.app';

module.exports = {
  getLatestRates: async (base = 'USD', symbols = 'EUR,GBP,JPY,CHF,AUD,CAD,CNY,HKD') => {
    const requestedSymbols = symbols.split(',').map(s => s.trim());

    // 1. Try Snapshot first — filter by requested symbols
    const snapshot = await snapshotParquet.readLatestSnapshot('forex');
    if (snapshot && snapshot.length > 0) {
      const filtered = snapshot.filter(item => {
        const quote = item.symbol.split('/')[1];
        return requestedSymbols.includes(quote);
      });
      if (filtered.length > 0) {
        console.log(`[ForexService] Serving ${filtered.length} rates from Disk Snapshot`);
        return filtered.map(item => ({
          ...item,
          name: `${base} to ${item.symbol.split('/')[1]}`,
          source: 'Parquet Snapshot'
        }));
      }
    }

    // 2. Fallback to Cache
    const cacheKey = `forex_latest_${base}_${symbols}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    // 3. Fallback to Live API
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

      // Save to snapshot so next request is fast
      await snapshotParquet.saveSnapshot('forex', normalized);
      cache.set(cacheKey, normalized, config.CACHE_TTLS.FOREX_RATE);
      return normalized;
    } catch (error) {
      console.error('Forex Service Error:', error.message);
      return cached.data || [];
    }
  },

  getHistory: async (base = 'USD', quote = 'EUR', interval = '1day') => {
    const symbol = `${base}/${quote}`;
    // Normalize timeframe name for parquet paths
    const tf = interval === '1day' ? '1d' : interval;
    
    // 1. Try Parquet first
    const localData = await parquetEngine.readHistory('forex', symbol, tf);
    if (localData && localData.length > 0) {
      console.log(`[ForexService] Serving ${symbol} (${interval}) from Parquet cache.`);
      return { symbol: `${base}/${quote}`, interval, points: localData };
    }

    // 2. Fallback to API (Twelve Data for high-fidelity OHLCV if needed)
    // For now, if parquet is missing, we stick to the Frankfurter logic for daily
    // but Twelve Data is better for intraday if we have the quota.
    if (tf === '1d') {
      try {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const startStr = start.toISOString().split('T')[0];

        console.log(`[Forex] Fetching ${symbol} history from Frankfurter fallback...`);
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
        await parquetEngine.saveHistory('forex', symbol, '1d', points, 'Frankfurter');
        return normalized;
      } catch (error) {
        console.error('Forex History Service Error:', error.message);
        return null;
      }
    }

    return { symbol: `${base}/${quote}`, interval, points: [] };
  }
};
