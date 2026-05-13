import { PRICE_TICK, TIME_SERIES } from '../schemas';
import { fetchFromBackend } from '../api';

export const forexAdapter = {
  getLatestRates: async (): Promise<PRICE_TICK[]> => {
    return await fetchFromBackend('/api/forex/latest') || [];
  },

  getHistory: async (base: string, quote: string): Promise<TIME_SERIES | null> => {
    return await fetchFromBackend('/api/forex/history', { base, quote });
  }
};
