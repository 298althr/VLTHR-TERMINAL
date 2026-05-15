require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
axios.defaults.timeout = 10000;
const rateLimitMiddleware = require('express-rate-limit');
const coingecko = require('./services/coingecko');
const forex = require('./services/forex');
const news = require('./services/news');
const macro = require('./services/macro');
const equities = require('./services/equities');
const signals = require('./services/signals');
const auth = require('./services/auth');
const db = require('./lib/db');
const rateLimit = require('./lib/rateLimit');
const quotaManager = require('./lib/quotaManager');
const ingestion = require('./services/ingestion');

const app = express();

// Trust proxy for Railway/Vercel rate limiting
app.set('trust proxy', 1);

// ── Seed volume from image data on first boot ─────────────────────
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const dataDir = '/app/data';
const seedDir = path.join(__dirname, 'data');

if (fs.existsSync(seedDir)) {
  const volumeEmpty = !fs.existsSync(dataDir) || fs.readdirSync(dataDir).filter(f => f !== '.initialized').length === 0;
  if (volumeEmpty) {
    console.log('[Init] Volume empty — seeding from image data...');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    copyDir(seedDir, dataDir);
    fs.writeFileSync(path.join(dataDir, '.initialized'), new Date().toISOString());
    console.log('[Init] Volume seeded successfully.');
  }
}

ingestion.start();
const PORT = process.env.PORT || 4000;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Auth Routes (Pre-limiter for high reliability)
app.post('/api/auth/request-code', async (req, res) => {
  console.log('[AUTH] Code request received');
  const result = await auth.generatePasscode();
  res.json(result);
});

app.post('/api/auth/verify', (req, res) => {
  const { code } = req.body;
  const isValid = auth.verifyPasscode(code);
  res.json({ success: isValid });
});

// System Stability Limiter (1000 requests per 15 mins)
const limiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  validate: { xForwardedForHeader: false }, // Disable the specific validation causing the crash
  message: { error: 'Too many requests, system throttling active.' }
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));

// Crypto Routes
app.get('/api/crypto/top', async (req, res) => {
  const data = await coingecko.getTopCoins();
  res.json(data);
});

app.get('/api/crypto/history', async (req, res) => {
  const { symbol, interval } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  // Normalize: BTC_USD → BTC/USD, bitcoin → BTC/USD
  let sym = symbol;
  if (sym.includes('_')) {
    sym = sym.replace(/_/g, '/');
  } else if (!sym.includes('/')) {
    sym = `${sym.toUpperCase()}/USD`;
  }
  const data = await equities.getHistory(sym, interval || '1day', null, 'crypto');
  res.json(data || { symbol: sym, interval, points: [] });
});

// Forex Routes
app.get('/api/forex/latest', async (req, res) => {
  const { base, symbols } = req.query;
  const data = await forex.getLatestRates(base, symbols);
  res.json(data || []);
});

app.get('/api/forex/history', async (req, res) => {
  const { base, quote, interval } = req.query;
  const data = await forex.getHistory(base, quote, interval || '1day');
  res.json(data || { points: [] });
});

const newsParquet = require('./lib/newsParquet');

// News Routes
app.get('/api/news', async (req, res) => {
  const { query } = req.query;
  const category = (query || 'finance').toLowerCase();

  // 1. Try parquet first (today's month)
  let disk = await newsParquet.readNews(category);
  if (disk && disk.length > 0) {
    return res.json(disk.slice(0, 50));
  }

  // 2. Fallback to live news service (will also save to parquet)
  const data = await news.getMarketNews(query);
  if (data && data.length > 0) {
    return res.json(data);
  }

  // 3. Seed demo articles so UI is never empty
  await newsParquet.seedNews(category);
  disk = await newsParquet.readNews(category);
  res.json(disk.slice(0, 50));
});

app.get('/api/news/search', async (req, res) => {
  const { q, category, limit } = req.query;
  if (!q) return res.status(400).json({ error: 'q param required' });
  const cat = (category || 'finance').toLowerCase();
  const results = await newsParquet.searchNews(cat, q, parseInt(limit) || 20);
  res.json(results);
});

app.get('/api/news/range', async (req, res) => {
  const { category, from, to } = req.query;
  const cat = (category || 'finance').toLowerCase();
  const fromDate = from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const toDate   = to   || new Date().toISOString().split('T')[0];
  const results = await newsParquet.readNewsByRange(cat, fromDate, toDate);
  res.json(results);
});

app.get('/api/news/index', async (req, res) => {
  const { category } = req.query;
  const cat = (category || 'finance').toLowerCase();
  res.json(newsParquet.readIndex(cat));
});

// Macro Routes
app.get('/api/macro/indicator', async (req, res) => {
  const { country, indicator } = req.query;
  const data = await macro.getIndicator(country, indicator);
  res.json(data || { indicator: 'Unavailable', points: [] });
});

app.get('/api/macro/yields', async (req, res) => {
  const data = await macro.getYieldCurve();
  res.json(data || { points: [] });
});

// Equities Routes
app.get('/api/equities/quote', async (req, res) => {
  const { symbol } = req.query;
  const data = await equities.getPrice(symbol);
  res.json(data);
});

app.get('/api/equities/history', async (req, res) => {
  const { symbol, interval } = req.query;
  const data = await equities.getHistory(symbol, interval);
  res.json(data);
});

app.get('/api/equities/fundamentals', async (req, res) => {
  const { symbol } = req.query;
  const data = await equities.getFundamentals(symbol);
  res.json(data);
});

// Signals Routes
app.get('/api/signals/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const data = await signals.getWeather(lat, lon);
  res.json(data);
});

app.get('/api/signals/hn', async (req, res) => {
  const data = await signals.getHNTopStories();
  res.json(data);
});

// ── Phase 4: New App Routes ──────────────────────────────────────────

// Economic Calendar
app.get('/api/calendar', async (req, res) => {
  // Logic to read from data/macro/calendar if it exists
  res.json({ events: [] });
});

// Options Desk
app.get('/api/options', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  // Placeholder: Options data usually requires specific premium endpoints
  res.json({ symbol, chains: [] });
});

// Screener
app.get('/api/screener', async (req, res) => {
  // Logic to scan snapshots parquet for multi-factor filtering
  res.json({ results: [] });
});

// Concierge (AI Research Proxy)
app.post('/api/concierge/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  // Placeholder: In production, this would call OpenAI/Anthropic with parquet context
  res.json({ 
    role: 'ai', 
    text: `Researching "${prompt}" across VLTHR data lake... Parquet indexing complete. No anomalies detected in current volatility clusters.` 
  });
});

// Reports
app.get('/api/reports', async (req, res) => {
  // Returns list of pre-generated PDF/JSON reports from data/reports
  res.json([
    { title: 'Weekly Macro Outlook', date: new Date().toISOString().split('T')[0], type: 'Macro' },
  ]);
});

// Portfolio Routes
app.get('/api/portfolio', (req, res) => res.json(db.read().portfolio));
app.post('/api/portfolio', (req, res) => {
  db.update('portfolio', req.body);
  res.json({ success: true });
});

// Alerts Routes
app.get('/api/alerts', (req, res) => res.json(db.read().alerts));
app.post('/api/alerts', (req, res) => {
  db.update('alerts', req.body);
  res.json({ success: true });
});

app.get('/api/alerts/check', async (req, res) => {
  const alerts = db.read().alerts;
  const triggered = [];
  
  // For demo, we'll just check the first few alerts against mock logic
  // In production, this would call coingecko/equities services
  res.json({ triggered: [] }); 
});

// Stats Route - Backend Budgets
app.get('/api/stats', (req, res) => {
  res.json(quotaManager.getStats());
});

// Catalog — returns only assets present in local parquet data store
app.get('/api/catalog', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const root = process.env.DATA_ROOT || path.join(__dirname, '../data');

  const scanDir = (dir) => {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) return [];
    return fs.readdirSync(full).filter(x => !x.startsWith('.'));
  };

  // Walk nested dirs and return leaf paths that contain .parquet files
  const scanSymbols = (dir) => {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) return [];
    const results = new Set();

    function walk(current, relParts) {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      let hasParquet = false;
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const entryPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath, [...relParts, entry.name]);
        } else if (entry.name.endsWith('.parquet')) {
          hasParquet = true;
        }
      }
      if (hasParquet && relParts.length > 0) {
        results.add(relParts.join('/'));
      }
    }

    walk(full, []);
    return Array.from(results);
  };

  res.json({
    crypto: scanSymbols('crypto'),
    equities: scanSymbols('equities'),
    forex: scanSymbols('forex'),
    macro: scanSymbols('macro'),
    news: scanDir('news'),
  });
});

app.listen(PORT, () => {
  console.log(`VLTHR Finance Backend running on port ${PORT}`);
});

// ── Hourly Live Price Scheduler ────────────────────────────────────
const HOUR_MS = 60 * 60 * 1000;
async function refreshLivePrices() {
  const ts = new Date().toISOString();
  console.log(`[Scheduler] Live price refresh started at ${ts}`);
  
  try {
    // 1. Crypto (Batch)
    const topCoins = await coingecko.getTopCoins();
    console.log(`[Scheduler] Crypto: ${topCoins?.length || 0} coins refreshed`);
  } catch (e) { console.error('[Scheduler] Crypto refresh failed:', e.message); }

  try {
    // 2. Forex (Batch)
    const data = await forex.getLatestRates('USD', 'EUR,GBP,JPY,CHF,CAD,AUD');
    console.log(`[Scheduler] Forex: ${data?.length || 0} pairs refreshed`);
  } catch (e) { console.error('[Scheduler] Forex refresh failed:', e.message); }

  try {
    // 3. Equities (Sequential with spacing to avoid 8 RPM limit)
    const tickers = ['AAPL','MSFT','NVDA','TSLA','GOOGL','AMZN','META','AMD'];
    console.log(`[Scheduler] Equities: Refreshing ${tickers.length} tickers sequentially...`);
    for (let i = 0; i < tickers.length; i++) {
      await equities.getPrice(tickers[i]);
      if (i < tickers.length - 1) {
        // Wait 12 seconds between each to stay well under 8 RPM (60/8 = 7.5s)
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }
    console.log(`[Scheduler] Equities: All quotes refreshed`);
  } catch (e) { console.error('[Scheduler] Equities refresh failed:', e.message); }
  
  console.log(`[Scheduler] Live price refresh completed at ${new Date().toISOString()}`);
}

// Run immediately on boot, then every hour
setTimeout(refreshLivePrices, 5000);
setInterval(refreshLivePrices, HOUR_MS);
