const axios = require('axios');
const cache = require('../lib/cache');
const config = require('../lib/config');
const quotaManager = require('../lib/quotaManager');
const rateLimit = require('../lib/rateLimit');
const parquetEngine = require('../lib/parquetEngine');
const aggregator = require('../lib/aggregator');
const snapshotParquet = require('../lib/snapshotParquet');

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY;
const FMP_KEY = process.env.FMP_KEY;

module.exports = {
  getPrice: async (symbol) => {
    // 1. Try Snapshot first
    const snapshot = await snapshotParquet.readLatestSnapshot('equities');
    if (snapshot && snapshot.length > 0) {
      const item = snapshot.find(s => s.symbol === symbol);
      if (item) {
        console.log(`[EquitiesService] Serving ${symbol} price from Disk Snapshot`);
        return {
          ...item,
          source: 'Parquet Snapshot'
        };
      }
    }

    // 2. Fallback to Cache
    const cacheKey = `equity_price_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    // 3. Fallback to Live API
    if (TWELVE_DATA_KEY && TWELVE_DATA_KEY !== 'your_twelve_data_key_here') {
      if (await quotaManager.consume('TWELVE_DATA')) {
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

          // Save to snapshot (wrapped as array)
          await snapshotParquet.saveSnapshot('equities', [normalized]);
          cache.set(cacheKey, normalized, config.CACHE_TTLS.STOCK_PRICE);
          return normalized;
        } catch (e) {
          console.error('[Equities] Price Fetch Error:', e.message);
        }
      }
    }
    return cached.data;
  },

  getHistory: async (symbol, interval = '1day', endDate = null, category = 'equities') => {
    // Normalize timeframe name for parquet paths (save uses '1d', read must match)
    const tf = interval === '1day' ? '1d' : interval;

    // 1. If requesting a derived timeframe (5m, 15m, 1h, 4h), try to find or synthesize
    if (!endDate && ['5min', '15min', '1h', '4h'].includes(interval)) {
      // First, try to find the already-synthesized Parquet file
      const existing = await parquetEngine.readHistory(category, symbol, tf);
      if (existing && existing.length > 0) {
        console.log(`[Equities] Serving PRE-SYNTHESIZED ${interval} for ${symbol}.`);
        return { symbol, interval, points: existing };
      }

      // If not found, load 1min source and synthesize JIT
      const source1m = await parquetEngine.readHistory(category, symbol, '1min');
      if (source1m && source1m.length > 0) {
        console.log(`[Equities] Synthesizing ${interval} from 1min Parquet for ${symbol}...`);
        const aggregated = aggregator.aggregate(source1m, interval);
        
        // SAVE the synthesis back to Parquet for next time
        await parquetEngine.saveHistory(category, symbol, tf, aggregated, 'Local Aggregator');
        
        return { symbol, interval, points: aggregated };
      }
    }

    // 2. Check Parquet Cache for the specific interval (Only if no specific endDate is requested)
    if (!endDate) {
      const localData = await parquetEngine.readHistory(category, symbol, tf);
      if (localData && localData.length > 0) {
        console.log(`[Equities] Serving ${symbol} (${interval}) from Parquet cache.`);
        return { symbol, interval, points: localData };
      }
    }

    // 3. Fetch from API if allowed
    if (TWELVE_DATA_KEY && TWELVE_DATA_KEY !== 'your_twelve_data_key_here') {
      if (await quotaManager.consume('TWELVE_DATA')) {
        try {
          const params = { symbol, interval, apikey: TWELVE_DATA_KEY, outputsize: 5000 };
          if (endDate) params.end_date = endDate;

          console.log(`[Equities] Fetching ${symbol} ${interval} ${endDate ? '(Until ' + endDate + ')' : ''} from Twelve Data...`);
          const res = await axios.get(`https://api.twelvedata.com/time_series`, { params });
          
          if (!res.data.values) return null;

          const points = res.data.values.map(v => ({
            t: new Date(v.datetime).getTime(),
            o: parseFloat(v.open),
            h: parseFloat(v.high),
            l: parseFloat(v.low),
            c: parseFloat(v.close),
            v: parseInt(v.volume)
          })).sort((a, b) => a.t - b.t);

          const normalized = { symbol, interval, points };
          
          // Save to Parquet
          await parquetEngine.saveHistory(category, symbol, tf, points, 'Twelve Data');
          
          cache.set(`equity_history_${symbol}_${interval}`, normalized, config.CACHE_TTLS.STOCK_PRICE);
          return normalized;
        } catch (e) {
          console.error('[Equities] History Fetch Error:', e.message);
        }
      }
    }
    return null;
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
          if (item) {
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
          }
        } catch (e) {
          console.error('[Equities] FMP Fundamental Fetch Error:', e.message);
        }
      }
    }

    // Fallback: Try reading from snapshots for Market Cap
    const snapshots = await snapshotParquet.readLatestSnapshot('equities');
    if (snapshots && snapshots.length > 0) {
      const item = snapshots.find(s => s.symbol === symbol);
      if (item) {
        console.log(`[Equities] Serving ${symbol} fundamentals (Market Cap) from Snapshot fallback.`);
        const fallback = {
          symbol,
          marketCap: item.market_cap || item.marketCap || 0,
          pe: 0,
          eps: 0,
          revenue: 0,
          debtToEquity: 0,
          dividendYield: 0,
          sector: item.sector || 'TECHNOLOGY'
        };
        return fallback;
      }
    }

    // Final fallback: synthetic data so UI never shows "—"
    console.log(`[Equities] No fundamentals for ${symbol}; returning synthetic fallback.`);
    const synthetic = {
      symbol,
      marketCap: 0,
      pe: 0,
      eps: 0,
      revenue: 0,
      debtToEquity: 0,
      dividendYield: 0,
      sector: 'Technology'
    };
    cache.set(cacheKey, synthetic, config.CACHE_TTLS.FUNDAMENTALS);
    return synthetic;
  }
};
