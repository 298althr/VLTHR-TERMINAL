import { PRICE_TICK } from '../schemas';
import { fetchFromBackend } from '../api';

export const coingeckoAdapter = {
  getTopCoins: async (): Promise<PRICE_TICK[]> => {
    return await fetchFromBackend('/api/crypto/top') || [];
  }
};
