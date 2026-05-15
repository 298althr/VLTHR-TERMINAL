import { fetchFromBackend } from '../api';

export interface Catalog {
  crypto: string[];
  equities: string[];
  forex: string[];
  macro: string[];
  news: string[];
}

export const catalogAdapter = {
  getCatalog: async (): Promise<Catalog> => {
    return await fetchFromBackend('/api/catalog') || { crypto: [], equities: [], forex: [], macro: [], news: [] };
  }
};
