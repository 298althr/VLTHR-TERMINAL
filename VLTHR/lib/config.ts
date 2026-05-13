/**
 * ALTHR Terminal Configuration
 * Standard TTLs and Rate Limits as defined in RULES.md
 */

export const CONFIG = {
  CACHE_TTLS: {
    CRYPTO_PRICE: 60 * 1000,      // 1 minute
    STOCK_PRICE: 5 * 60 * 1000,    // 5 minutes
    FOREX_RATE: 30 * 60 * 1000,    // 30 minutes
    NEWS: 10 * 60 * 1000,          // 10 minutes
    MACRO: 7 * 24 * 60 * 60 * 1000, // 7 days
    FUNDAMENTALS: 24 * 60 * 60 * 1000, // 24 hours
    WEATHER: 60 * 60 * 1000,       // 1 hour
  },
  
  RATE_LIMITS: {
    COINGECKO: 1440,
    TWELVE_DATA: 800,
    ALPHA_VANTAGE: 25,
    FINANCIAL_MODELING_PREP: 250,
    MARKET_AUX: 100,
    NEWS_API: 100,
    GNEWS: 100,
  }
};
