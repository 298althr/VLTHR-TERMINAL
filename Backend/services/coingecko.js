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

    if (!rateLimit.increment('COINGECKO', config.RATE_LIMITS.COINGECKO)) {
      return cached.data || [];
    }

    try {
      const res = await axios.get(`${BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      const normalized = res.data.map(coin => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePct: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        high: coin.high_24h,
        low: coin.low_24h,
        open: coin.current_price - coin.price_change_24h,
        close: coin.current_price,
        timestamp: Date.now(),
        source: 'CoinGecko'
      }));

      cache.set(cacheKey, normalized, config.CACHE_TTLS.CRYPTO_PRICE);
      return normalized;
    } catch (error) {
      console.error('CoinGecko Service Error:', error.message);
      return cached.data || [];
    }
  }
};
