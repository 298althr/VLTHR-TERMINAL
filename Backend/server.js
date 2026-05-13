require('dotenv').config();
const express = require('express');
const cors = require('cors');
const coingecko = require('./services/coingecko');
const forex = require('./services/forex');
const news = require('./services/news');
const macro = require('./services/macro');
const equities = require('./services/equities');
const signals = require('./services/signals');
const db = require('./lib/db');
const rateLimit = require('./lib/rateLimit');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));

// Crypto Routes
app.get('/api/crypto/top', async (req, res) => {
  const data = await coingecko.getTopCoins();
  res.json(data);
});

// Forex Routes
app.get('/api/forex/latest', async (req, res) => {
  const data = await forex.getLatestRates();
  res.json(data);
});

app.get('/api/forex/history', async (req, res) => {
  const { base, quote } = req.query;
  const data = await forex.getHistory(base, quote);
  res.json(data);
});

// News Routes
app.get('/api/news', async (req, res) => {
  const { query } = req.query;
  const data = await news.getMarketNews(query);
  res.json(data);
});

// Macro Routes
app.get('/api/macro/indicator', async (req, res) => {
  const { country, indicator } = req.query;
  const data = await macro.getIndicator(country, indicator);
  res.json(data);
});

app.get('/api/macro/yields', async (req, res) => {
  const data = await macro.getYieldCurve();
  res.json(data);
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

// Stats Route
app.get('/api/stats', (req, res) => {
  const providers = ['COINGECKO', 'TWELVE_DATA', 'ALPHA_VANTAGE', 'FINANCIAL_MODELING_PREP', 'MARKET_AUX', 'NEWS_API', 'GNEWS'];
  const stats = {};
  providers.forEach(p => {
    stats[p] = rateLimit.getStats(p);
  });
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`ALTHR Terminal Backend running on port ${PORT}`);
});
