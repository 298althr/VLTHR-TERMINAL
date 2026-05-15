const equities = require('./equities');
const forex = require('./forex');
const macro = require('./macro');
const news = require('./news');

/**
 * IngestionService
 * Orchestrates the "Harvesting" of historical data into the Parquet lake.
 */

const DEFAULT_WATCHLIST = {
  equities: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD'],
  crypto: [
    { id: 'bitcoin', symbol: 'BTC/USD' },
    { id: 'ethereum', symbol: 'ETH/USD' },
    { id: 'solana', symbol: 'SOL/USD' },
    { id: 'ripple', symbol: 'XRP/USD' },
    { id: 'cardano', symbol: 'ADA/USD' },
  ],
  forex: [
    { base: 'USD', quote: 'EUR' },
    { base: 'USD', quote: 'GBP' },
    { base: 'USD', quote: 'JPY' },
    { base: 'USD', quote: 'CHF' },
    { base: 'USD', quote: 'AUD' },
    { base: 'USD', quote: 'CAD' },
    { base: 'USD', quote: 'CNY' },
    { base: 'USD', quote: 'HKD' },
    { base: 'EUR', quote: 'GBP' },
    { base: 'EUR', quote: 'JPY' },
    { base: 'GBP', quote: 'JPY' }
  ],
  macro: [
    { country: 'USA', indicators: ['NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS'] },
    { country: 'CHN', indicators: ['NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG'] }
  ]
};

const NEWS_CATEGORIES = ['finance', 'stocks', 'crypto', 'tech', 'economy'];

class IngestionService {
  constructor() {
    this.isSyncing = false;
    this.lastNewsSync = 0; // timestamp of last news sync
  }

  async start() {
    console.log('[Ingestion] Initializing Data Request Pipeline...');
    this.syncAll();

    // Interval for background backfilling (every 4 hours)
    setInterval(() => this.syncAll(), 4 * 60 * 60 * 1000);
  }

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log('[Ingestion] Starting Full Sync Cycle...');

    try {
      await this.syncEquities();
      await this.syncCrypto();
      await this.syncForex();
      await this.syncMacro();
      await this.syncNews(); // respects daily throttle internally
    } catch (e) {
      console.error('[Ingestion] Sync Cycle Failed:', e.message);
    } finally {
      this.isSyncing = false;
      console.log('[Ingestion] Sync Cycle Complete.');
    }
  }

  async syncNews() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - this.lastNewsSync < oneDay) {
      console.log('[Ingestion] News sync skipped (last sync < 24h)');
      return;
    }

    console.log('[Ingestion] Starting News Sync (respecting rate limits)...');
    let total = 0;
    for (const category of NEWS_CATEGORIES) {
      try {
        const articles = await news.getMarketNews(category);
        if (articles && articles.length > 0) {
          total += articles.length;
          console.log(`[Ingestion] News [${category}]: +${articles.length} articles`);
        } else {
          console.log(`[Ingestion] News [${category}]: no new articles (API quota or key missing)`);
        }
        // Sleep 1.2s between categories to stay under rate limits
        await new Promise(r => setTimeout(r, 1200));
      } catch (e) {
        console.error(`[Ingestion] News [${category}] failed:`, e.message);
      }
    }
    this.lastNewsSync = now;
    console.log(`[Ingestion] News Sync Complete. Total: ${total} articles`);
  }

  async syncEquities() {
    for (const symbol of DEFAULT_WATCHLIST.equities) {
      // 1. Fetch 1-Day History (Deep)
      await equities.getHistory(symbol, '1day');
      
      // 2. Fetch 1-Minute History (Source for 5m, 15m, 1h, 4h)
      await equities.getHistory(symbol, '1min');
    }
  }

  async syncCrypto() {
    for (const c of DEFAULT_WATCHLIST.crypto) {
      // Daily update via Twelve Data (real OHLCV) into data/crypto/
      await equities.getHistory(c.symbol, '1day', null, 'crypto');
      // 1-minute source data for synthesis
      await equities.getHistory(c.symbol, '1min', null, 'crypto');
    }
  }

  async syncForex() {
    for (const pair of DEFAULT_WATCHLIST.forex) {
      const symbol = `${pair.base}/${pair.quote}`;
      // Daily update via Twelve Data (real OHLCV) into data/forex/
      await equities.getHistory(symbol, '1day', null, 'forex');
      // 1-minute source data for synthesis
      await equities.getHistory(symbol, '1min', null, 'forex');
    }
  }

  async syncMacro() {
    for (const item of DEFAULT_WATCHLIST.macro) {
      for (const ind of item.indicators) {
        await macro.getIndicator(item.country, ind);
      }
    }
  }
}

module.exports = new IngestionService();
