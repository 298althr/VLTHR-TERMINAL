import { PRICE_TICK, TIME_SERIES } from '../schemas';
import { CONFIG } from '../config';
import { rateLimiter } from '../rateLimit';
import { cacheManager } from '../cache';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const LIMIT = CONFIG.RATE_LIMITS.COINGECKO;

export const coingeckoAdapter = {
  getTopCoins: async (limit = 20): Promise<PRICE_TICK[]> => {
    if (!rateLimiter.increment('coingecko', LIMIT)) {
      const cached = cacheManager.get<PRICE_TICK[]>('top_coins');
      return cached.data || [];
    }

    try {
      const res = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );
      const data = await res.json();

      const normalized: PRICE_TICK[] = data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePct: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        high: coin.high_24h,
        low: coin.low_24h,
        open: coin.current_price - coin.price_change_24h, // Approx
        close: coin.current_price,
        timestamp: Date.now(),
        source: 'CoinGecko'
      }));

      cacheManager.set('top_coins', normalized, CONFIG.CACHE_TTLS.CRYPTO_PRICE);
      return normalized;
    } catch (error) {
      console.error('CoinGecko Adapter Error:', error);
      const cached = cacheManager.get<PRICE_TICK[]>('top_coins');
      return cached.data || [];
    }
  },

  getHistory: async (id: string, days = 30): Promise<TIME_SERIES> => {
    const cacheKey = `history_${id}_${days}`;
    if (!rateLimiter.increment('coingecko', LIMIT)) {
      const cached = cacheManager.get<TIME_SERIES>(cacheKey);
      return cached.data || { symbol: id, interval: 'daily', points: [] };
    }

    try {
      const res = await fetch(`${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
      const data = await res.json();

      const points = data.prices.map((p: any) => ({
        t: p[0],
        o: p[1],
        h: p[1],
        l: p[1],
        c: p[1],
        v: 0 // CoinGecko chart response for prices doesn't include volume per tick here easily
      }));

      const normalized: TIME_SERIES = {
        symbol: id.toUpperCase(),
        interval: 'daily',
        points
      };

      cacheManager.set(cacheKey, normalized, 3600 * 1000); // 1 hour TTL for history
      return normalized;
    } catch (error) {
      console.error('CoinGecko History Error:', error);
      const cached = cacheManager.get<TIME_SERIES>(cacheKey);
      return cached.data || { symbol: id, interval: 'daily', points: [] };
    }
  }
};
