import { MACRO_SERIES } from '../schemas';
import { fetchFromBackend } from '../api';

export const macroAdapter = {
  getIndicator: async (country: string, indicator: string): Promise<MACRO_SERIES | null> => {
    return await fetchFromBackend('/api/macro/indicator', { country, indicator });
  },

  getYieldCurve: async (): Promise<MACRO_SERIES | null> => {
    return await fetchFromBackend('/api/macro/yields');
  }
};
