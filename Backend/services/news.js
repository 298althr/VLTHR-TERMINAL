const axios = require('axios');
const cache = require('../lib/cache');
const rateLimit = require('../lib/rateLimit');
const config = require('../lib/config');
const newsParquet = require('../lib/newsParquet');

const MARKETAUX_KEY = process.env.MARKETAUX_KEY;
const NEWSAPI_KEY = process.env.NEWS_API_KEY;

module.exports = {
  /**
   * Serves news from parquet first, then live API as fallback.
   */
  getMarketNews: async (query = 'general') => {
    // 1. Try Parquet first (serves from local disk)
    const category = query.toLowerCase();
    const diskData = await newsParquet.readNews(category);
    if (diskData && diskData.length > 0) {
      console.log(`[NewsService] Serving ${category} from Disk Parquet`);
      return diskData;
    }

    // 2. Fallback to Cache
    const cacheKey = `news_${category}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    // 3. Fallback to live API (only if absolutely necessary)
    console.log(`[NewsService] Parquet/Cache missing. Hitting Live API for ${category}`);
    
    // Try MarketAux
    if (MARKETAUX_KEY && MARKETAUX_KEY !== 'your_marketaux_key_here') {
      if (rateLimit.increment('MARKET_AUX', config.RATE_LIMITS.MARKET_AUX)) {
        try {
          const res = await axios.get(`https://api.marketaux.com/v1/news/all`, {
            params: { language: 'en', api_token: MARKETAUX_KEY, q: category }
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
          
          // Save to parquet so next request is fast
          await newsParquet.saveNews(category, normalized);
          cache.set(cacheKey, normalized, config.CACHE_TTLS.NEWS);
          return normalized;
        } catch (e) {
          console.error(`[NewsService] MarketAux Failed:`, e.message);
        }
      }
    }

    // Fallback to NewsAPI
    if (NEWSAPI_KEY && NEWSAPI_KEY !== 'your_news_api_key_here') {
      if (rateLimit.increment('NEWS_API', config.RATE_LIMITS.NEWS_API)) {
        try {
          const res = await axios.get(`https://newsapi.org/v2/everything`, {
            params: { q: category, sortBy: 'publishedAt', apiKey: NEWSAPI_KEY }
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

          await newsParquet.saveNews(category, normalized);
          cache.set(cacheKey, normalized, config.CACHE_TTLS.NEWS);
          return normalized;
        } catch (e) {
          console.error(`[NewsService] NewsAPI Failed:`, e.message);
        }
      }
    }

    return cached.data || [];
  }
};
