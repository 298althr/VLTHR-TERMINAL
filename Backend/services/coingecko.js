const axios = require('axios');
const cache = require('../lib/cache');
const rateLimit = require('../lib/rateLimit');
const config = require('../lib/config');

const BASE_URL = 'https://api.coingecko.com/api/v3';

module.exports = {
  getTopCoins: async (limit = 20) => {
    const cacheKey = 'top_coins';
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    const snapshotParquet = require('../lib/snapshotParquet');

    try {
      const res = await axios.get(`${BASE_URL}/coins/markets`, {
        params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: limit, page: 1, sparkline: false }
      });

      const normalized = res.data.map(coin => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePct: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        volume: coin.total_volume,
        high: coin.high_24h,
        low: coin.low_24h,
        open: coin.current_price - coin.price_change_24h,
        close: coin.current_price,
        timestamp: Date.now(),
        source: 'CoinGecko'
      }));

      // Save to Parquet snapshots
      await snapshotParquet.saveSnapshot('crypto', normalized);

      cache.set(cacheKey, normalized, config.CACHE_TTLS.CRYPTO_PRICE);
      return normalized;
    } catch (error) {
      console.error('[CoinGecko] Market Fetch Failed:', error.message);

      // If live fetch fails, try reading from the latest Parquet snapshot
      const disk = await snapshotParquet.readLatestSnapshot('crypto');
      if (disk && disk.length > 0) {
        console.log(`[CoinGecko] Serving ${disk.length} coins from Parquet snapshot.`);
        return disk;
      }

      // Final fallback: hardcoded defaults so UI never breaks
      console.log('[CoinGecko] Returning hardcoded fallback prices.');
      return cached.data || [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67200, change: 1200, changePct: 1.82, market_cap: 1320000000000, volume: 28000000000, high: 68100, low: 65900, open: 66000, close: 67200, timestamp: Date.now(), source: 'Fallback' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3520, change: 45, changePct: 1.29, market_cap: 422000000000, volume: 15000000000, high: 3580, low: 3450, open: 3475, close: 3520, timestamp: Date.now(), source: 'Fallback' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', price: 148, change: 3.5, changePct: 2.42, market_cap: 68000000000, volume: 3200000000, high: 152, low: 143, open: 144.5, close: 148, timestamp: Date.now(), source: 'Fallback' },
        { id: 'ripple', symbol: 'XRP', name: 'Ripple', price: 0.52, change: 0.01, changePct: 1.96, market_cap: 28500000000, volume: 1200000000, high: 0.53, low: 0.51, open: 0.51, close: 0.52, timestamp: Date.now(), source: 'Fallback' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.45, change: 0.008, changePct: 1.81, market_cap: 16000000000, volume: 450000000, high: 0.46, low: 0.44, open: 0.442, close: 0.45, timestamp: Date.now(), source: 'Fallback' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change: 0.002, changePct: 1.69, market_cap: 17500000000, volume: 850000000, high: 0.125, low: 0.118, open: 0.118, close: 0.12, timestamp: Date.now(), source: 'Fallback' }
      ];
    }
  },

  getHistory: async (id, days = 30) => {
    const parquetEngine = require('../lib/parquetEngine');
    const localData = await parquetEngine.readHistory('crypto', id, '1d');
    if (localData && localData.length > 0) return { id, points: localData };

    try {
      const res = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
        params: { vs_currency: 'usd', days: days, interval: 'daily' }
      });
      
      const points = res.data.prices.map(([ts, price]) => ({
        t: ts,
        o: price,
        h: price,
        l: price,
        c: price,
        v: 0
      }));

      await parquetEngine.saveHistory('crypto', id, '1d', points, 'CoinGecko');
      return { id, points };
    } catch (e) {
      console.error('[Crypto] History Error:', e.message);
      return null;
    }
  }
};
