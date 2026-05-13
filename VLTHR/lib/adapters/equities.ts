import { PRICE_TICK, TIME_SERIES, FUNDAMENTAL } from '../schemas';
import { fetchFromBackend } from '../api';

export const equitiesAdapter = {
  getPrice: async (symbol: string): Promise<PRICE_TICK | null> => {
    return await fetchFromBackend('/api/equities/quote', { symbol });
  },

  getHistory: async (symbol: string, interval = '1day'): Promise<TIME_SERIES | null> => {
    return await fetchFromBackend('/api/equities/history', { symbol, interval });
  },

  getFundamentals: async (symbol: string): Promise<FUNDAMENTAL | null> => {
    return await fetchFromBackend('/api/equities/fundamentals', { symbol });
  }
};
