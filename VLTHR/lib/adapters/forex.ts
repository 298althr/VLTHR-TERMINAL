import { PRICE_TICK, TIME_SERIES } from '../schemas';
import { fetchFromBackend } from '../api';

export const forexAdapter = {
  getLatestRates: async (base?: string, symbols?: string | string[]): Promise<PRICE_TICK[]> => {
    const syms = Array.isArray(symbols) ? symbols.join(',') : (symbols || '');
    return await fetchFromBackend('/api/forex/latest', { base: base || 'USD', symbols: syms }) || [];
  },

  getHistory: async (base: string, quote: string, days?: number): Promise<TIME_SERIES | null> => {
    return await fetchFromBackend('/api/forex/history', { base, quote, days: (days || 30).toString() });
  }
};
