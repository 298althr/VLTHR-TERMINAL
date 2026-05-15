import { PRICE_TICK, TIME_SERIES } from '../schemas';
import { fetchFromBackend } from '../api';

export const coingeckoAdapter = {
  getTopCoins: async (): Promise<PRICE_TICK[]> => {
    return await fetchFromBackend('/api/crypto/top') || [];
  },

  getHistory: async (symbol: string, interval = '1day'): Promise<TIME_SERIES | null> => {
    return await fetchFromBackend('/api/crypto/history', { symbol, interval });
  }
};
