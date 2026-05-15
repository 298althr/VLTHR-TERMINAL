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
      await snapshotParquet.save('crypto', normalized);

      cache.set(cacheKey, normalized, config.CACHE_TTLS.CRYPTO_PRICE);
      return normalized;
    } catch (error) {
      console.error('[CoinGecko] Market Fetch Failed:', error.message);
      
      // If live fetch fails, try reading from the latest Parquet snapshot
      const disk = await snapshotParquet.readLatest('crypto');
      if (disk && disk.length > 0) {
        console.log(`[CoinGecko] Serving ${disk.length} coins from Parquet snapshot.`);
        return disk;
      }
      
      return cached.data || [];
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
