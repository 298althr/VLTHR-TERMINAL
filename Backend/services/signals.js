const axios = require('axios');
const cache = require('../lib/cache');
const config = require('../lib/config');

const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

module.exports = {
  getWeather: async (lat = 40.7128, lon = -74.0060) => {
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    if (OPENWEATHER_KEY && OPENWEATHER_KEY !== 'your_openweather_key_here') {
      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: { lat, lon, units: 'metric', appid: OPENWEATHER_KEY }
        });
        const normalized = [
          { id: `temp_${lat}_${lon}`, type: 'WEATHER', symbol: 'TEMP', value: res.data.main.temp, label: 'Temperature (°C)', timestamp: Date.now() },
          { id: `humidity_${lat}_${lon}`, type: 'WEATHER', symbol: 'HUM', value: res.data.main.humidity, label: 'Humidity (%)', timestamp: Date.now() }
        ];
        cache.set(cacheKey, normalized, config.CACHE_TTLS.WEATHER);
        return normalized;
      } catch (e) {}
    }

    // Fallback to Open-Meteo
    try {
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: { latitude: lat, longitude: lon, current_weather: true }
      });
      const normalized = [
        { id: `temp_${lat}_${lon}`, type: 'WEATHER', symbol: 'TEMP', value: res.data.current_weather.temperature, label: 'Temperature (°C)', timestamp: Date.now() },
        { id: `wind_${lat}_${lon}`, type: 'WEATHER', symbol: 'WIND', value: res.data.current_weather.windspeed, label: 'Wind Speed (km/h)', timestamp: Date.now() }
      ];
      cache.set(cacheKey, normalized, config.CACHE_TTLS.WEATHER);
      return normalized;
    } catch (e) {
      return cached.data || [];
    }
  },

  getHNTopStories: async (limit = 10) => {
    const cacheKey = 'hn_top_stories';
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    try {
      const res = await axios.get(`https://hacker-news.firebaseio.com/v0/topstories.json`);
      const topIds = res.data.slice(0, limit);
      const stories = await Promise.all(topIds.map(async id => {
        const sRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return sRes.data;
      }));
      const normalized = stories.map(s => ({
        id: s.id.toString(),
        title: s.title,
        summary: `Score: ${s.score} | By: ${s.by}`,
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        source: 'HackerNews',
        publishedAt: new Date(s.time * 1000).toISOString(),
        tickers: []
      }));
      cache.set(cacheKey, normalized, config.CACHE_TTLS.NEWS);
      return normalized;
    } catch (e) {
      return cached.data || [];
    }
  }
};
