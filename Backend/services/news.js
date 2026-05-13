const axios = require('axios');
const cache = require('../lib/cache');
const rateLimit = require('../lib/rateLimit');
const config = require('../lib/config');

const MARKETAUX_KEY = process.env.NEXT_PUBLIC_MARKETAUX_KEY;
const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

module.exports = {
  getMarketNews: async (query = 'finance') => {
    const cacheKey = `news_${query}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    // Try MarketAux
    if (MARKETAUX_KEY && MARKETAUX_KEY !== 'your_marketaux_key_here') {
      if (rateLimit.increment('MARKET_AUX', config.RATE_LIMITS.MARKET_AUX)) {
        try {
          const res = await axios.get(`https://api.marketaux.com/v1/news/all`, {
            params: { language: 'en', api_token: MARKETAUX_KEY, q: query }
          });
          const normalized = res.data.data.map(item => ({
            id: item.uuid,
            title: item.title,
            summary: item.description,
            url: item.url,
            source: item.source,
            publishedAt: item.published_at,
            tickers: item.entities?.map(e => e.symbol) || [],
            sentiment: item.entities?.[0]?.sentiment_score > 0 ? 'positive' : 'negative',
            imageUrl: item.image_url
          }));
          cache.set(cacheKey, normalized, config.CACHE_TTLS.NEWS);
          return normalized;
        } catch (e) {}
      }
    }

    // Fallback to NewsAPI
    if (NEWSAPI_KEY && NEWSAPI_KEY !== 'your_news_api_key_here') {
      if (rateLimit.increment('NEWS_API', config.RATE_LIMITS.NEWS_API)) {
        try {
          const res = await axios.get(`https://newsapi.org/v2/everything`, {
            params: { q: query, sortBy: 'publishedAt', apiKey: NEWSAPI_KEY }
          });
          const normalized = res.data.articles.map(item => ({
            id: item.url,
            title: item.title,
            summary: item.description,
            url: item.url,
            source: item.source.name,
            publishedAt: item.publishedAt,
            tickers: [],
            imageUrl: item.urlToImage
          }));
          cache.set(cacheKey, normalized, config.CACHE_TTLS.NEWS);
          return normalized;
        } catch (e) {}
      }
    }

    return cached.data || [];
  }
};
