import { SIGNAL, NEWS_ITEM } from '../schemas';
import { fetchFromBackend } from '../api';

export const signalsAdapter = {
  getWeather: async (lat = 40.7128, lon = -74.0060): Promise<SIGNAL[]> => {
    return await fetchFromBackend('/api/signals/weather', { lat: lat.toString(), lon: lon.toString() }) || [];
  },

  getHNTopStories: async (limit?: number): Promise<NEWS_ITEM[]> => {
    return await fetchFromBackend('/api/signals/hn', { limit: (limit || 10).toString() }) || [];
  }
};
