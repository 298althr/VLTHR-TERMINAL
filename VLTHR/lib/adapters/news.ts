import { NEWS_ITEM } from '../schemas';
import { fetchFromBackend } from '../api';

export const newsAdapter = {
  getMarketNews: async (category: string): Promise<NEWS_ITEM[]> => {
    return await fetchFromBackend('/api/news', { query: category }) || [];
  },

  search: async (q: string, category: string, limit = 20): Promise<NEWS_ITEM[]> => {
    return await fetchFromBackend('/api/news/search', { q, category, limit: String(limit) }) || [];
  },

  getRange: async (category: string, from: string, to: string): Promise<NEWS_ITEM[]> => {
    return await fetchFromBackend('/api/news/range', { category, from, to }) || [];
  }
};
