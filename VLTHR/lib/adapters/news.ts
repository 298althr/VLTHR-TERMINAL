import { NEWS_ITEM } from '../schemas';
import { fetchFromBackend } from '../api';

export const newsAdapter = {
  getMarketNews: async (query: string): Promise<NEWS_ITEM[]> => {
    return await fetchFromBackend('/api/news', { query }) || [];
  }
};
