const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');
const cliProgress = require('cli-progress');
const newsParquet = require('./lib/newsParquet');

/**
 * VLTHR Terminal — News Historical Harvest  (v2 — Focused + Efficient)
 *
 * Strategy:
 *  - 50 requests/day max (leaving ~50 buffer of the 100/day free plan)
 *  - 50 articles per request = 2,500 max articles per run
 *  - 10 requests per category × 5 categories = 50 requests/day
 *  - Most recent data first (works backwards), so Day 1 = most valuable data
 *  - English only — no language-irrelevant noise
 *  - Tight, business-specific keyword filters to maximise relevance per article
 *  - must_have_entities=true on ticker-tagged categories to eliminate generic noise
 *  - Resumable: checks index.json — skips fully-covered months
 *  - Default range: 6 months back from today (achievable in 2 days)
 *
 * Run:  node Backend/harvestNews.js
 *       node Backend/harvestNews.js --category crypto
 *       node Backend/harvestNews.js --from 2024-11-01 --to 2025-05-01
 */

const MARKETAUX_KEY = process.env.MARKETAUX_KEY || process.env.NEXT_PUBLIC_MARKETAUX_KEY;
const BASE_URL      = 'https://api.marketaux.com/v1/news/all';
const PAGE_SIZE     = 50;    // max articles per request
const MAX_PER_DAY   = 50;    // daily request ceiling (conservative)
const REQ_PER_CAT   = 10;    // max requests per category per run
const SLEEP_MS      = 1100;  // 1 req/sec — stay within rate limits

// ─── Category Query Profiles ─────────────────────────────────────────────────
// Kept deliberately narrow to avoid redundant general news.
// entity_types focuses MarketAux entity tagging to financial instruments.
// must_have_entities=true means articles MUST reference a tracked financial entity.
const CATEGORY_QUERIES = {
  finance: {
    q: 'investment portfolio wealth management asset allocation hedge fund bond yield dividend',
    entity_types: 'equity,index',
    must_have_entities: true,
    language: 'en',
    description: 'Portfolio & wealth management, bond markets, institutional finance'
  },
  stocks: {
    q: 'earnings revenue profit margin guidance analyst upgrade downgrade IPO buyback S&P 500 NASDAQ',
    entity_types: 'equity',
    must_have_entities: true,
    language: 'en',
    description: 'Equity earnings, analyst coverage, index moves'
  },
  crypto: {
    q: 'bitcoin ethereum solana BTC ETH crypto blockchain DeFi altcoin institutional adoption staking',
    entity_types: 'cryptocurrency',
    must_have_entities: true,
    language: 'en',
    description: 'Digital assets, on-chain, DeFi, institutional crypto adoption'
  },
  tech: {
    q: 'artificial intelligence AI semiconductor NVIDIA Apple Microsoft Google Meta Amazon cloud SaaS chip',
    entity_types: 'equity',
    must_have_entities: true,
    language: 'en',
    description: 'Tech sector equities, AI, semiconductors, cloud'
  },
  economy: {
    q: 'federal reserve inflation interest rate GDP unemployment CPI central bank monetary policy recession trade tariff',
    entity_types: '',
    must_have_entities: false,
    language: 'en',
    description: 'Macro economy, central bank policy, global economic indicators'
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function dateToStr(d) {
  return d.toISOString().split('T')[0];
}

/**
 * Weekly windows, newest first (most valuable data harvested first).
 */
function weeklyWindowsNewestFirst(fromDate, toDate) {
  const windows = [];
  let cur = new Date(toDate);
  const start = new Date(fromDate);
  while (cur > start) {
    const prev = new Date(cur);
    prev.setDate(prev.getDate() - 7);
    windows.push({
      from: dateToStr(prev < start ? start : prev),
      to:   dateToStr(cur)
    });
    cur = prev;
  }
  return windows; // newest window is windows[0]
}

/**
 * Check index.json — return months that already have >20 quality articles.
 */
function coveredMonths(category) {
  const idx = newsParquet.readIndex(category);
  return new Set(
    Object.entries(idx.months || {})
      .filter(([, v]) => v.count > 20)
      .map(([k]) => k)
  );
}

/**
 * Fetch one page of news from MarketAux for a window + category.
 */
async function fetchPage(category, window, page) {
  const profile = CATEGORY_QUERIES[category];
  const params = {
    api_token: MARKETAUX_KEY,
    language:  'en',
    page,
    limit:     PAGE_SIZE,
    sort:      'published_on',
    published_after:  `${window.from}T00:00:00`,
    published_before: `${window.to}T23:59:59`,
    q:         profile.q
  };

  // Only add entity_types if non-empty
  if (profile.entity_types) params.entity_types = profile.entity_types;
  if (profile.must_have_entities) params.must_have_entities = 'true';

  const res = await axios.get(BASE_URL, { params, timeout: 15000 });
  return res.data;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function harvest(options = {}) {
  if (!MARKETAUX_KEY) {
    console.error('❌  MARKETAUX_KEY not set in .env');
    process.exit(1);
  }

  const today      = new Date();
  const sixMonAgo  = new Date(today);
  sixMonAgo.setMonth(sixMonAgo.getMonth() - 6);

  const fromDate   = options.from || dateToStr(sixMonAgo);
  const toDate     = options.to   || dateToStr(today);
  const categories = options.category ? [options.category] : newsParquet.CATEGORIES;

  console.log('\n📰  VLTHR Terminal — News Harvest  (Focused Mode)');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Range      : ${fromDate} → ${toDate}`);
  console.log(`  Categories : ${categories.join(', ')}`);
  console.log(`  Max req/day: ${MAX_PER_DAY} (${REQ_PER_CAT}/category)`);
  console.log(`  Mode       : Newest-first  |  English only  |  Business-focused`);
  console.log('════════════════════════════════════════════════════\n');

  let totalRequests = 0;
  let grandTotal    = 0;

  for (const category of categories) {
    if (totalRequests >= MAX_PER_DAY) {
      console.log(`\n⚠️  Daily request ceiling reached (${MAX_PER_DAY}). Run again tomorrow.`);
      break;
    }

    const profile = CATEGORY_QUERIES[category];
    console.log(`\n📂  ${category.toUpperCase()} — ${profile.description}`);
    newsParquet.ensureDir(category);

    const covered = coveredMonths(category);
    const windows = weeklyWindowsNewestFirst(fromDate, toDate);
    let catReqs = 0, catTotal = 0;

    const bar = new cliProgress.SingleBar({
      format: `  {bar} | {percentage}% | {value}/{total} | +{articles} articles | {label}`,
    }, cliProgress.Presets.shades_grey);

    bar.start(Math.min(windows.length, REQ_PER_CAT), 0, { articles: 0, label: 'Starting...' });

    for (const win of windows) {
      if (catReqs >= REQ_PER_CAT || totalRequests >= MAX_PER_DAY) break;

      const winMonthFrom = newsParquet.yearMonth(win.from);
      const winMonthTo   = newsParquet.yearMonth(win.to);
      if (covered.has(winMonthFrom) && covered.has(winMonthTo)) {
        bar.increment(1, { label: `SKIP ${winMonthTo} (covered)` });
        continue;
      }

      let pageData;
      try {
        pageData = await fetchPage(category, win, 1);
        catReqs++;
        totalRequests++;
        await sleep(SLEEP_MS);
      } catch (e) {
        bar.increment(1, { label: `ERR ${win.from}: ${e.message?.slice(0, 40)}` });
        continue;
      }

      const articles = pageData.data || [];
      if (articles.length === 0) {
        bar.increment(1, { label: `EMPTY ${win.from}` });
        continue;
      }

      // Group by year-month and save
      const byMonth = {};
      for (const a of articles) {
        const ym = newsParquet.yearMonth(a.published_at);
        if (!byMonth[ym]) byMonth[ym] = [];
        byMonth[ym].push(a);
      }
      for (const [ym, batch] of Object.entries(byMonth)) {
        const saved = await newsParquet.saveNewsBatch(category, ym, batch);
        catTotal  += saved;
        grandTotal += saved;
      }

      bar.increment(1, { articles: catTotal, label: `${win.from} (+${articles.length})` });
    }

    bar.stop();

    const idx = newsParquet.readIndex(category);
    const sentiment = Object.values(idx.months || {}).reduce((acc, m) => {
      for (const [k, v] of Object.entries(m.sentimentBreakdown || {})) {
        acc[k] = (acc[k] || 0) + v;
      }
      return acc;
    }, {});

    console.log(`  ✅  ${category}: +${catTotal} new | Total in store: ${idx.total}`);
    console.log(`  �  Months: ${Object.keys(idx.months || {}).sort().reverse().join(', ')}`);
    console.log(`  💬  Sentiment: +${sentiment.positive || 0} pos | ${sentiment.neutral || 0} neu | ${sentiment.negative || 0} neg`);
    console.log(`  🔑  Requests used: ${catReqs}`);
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log(`  🏁  Run Complete`);
  console.log(`  New articles saved : ${grandTotal}`);
  console.log(`  API requests used  : ${totalRequests} / ${MAX_PER_DAY}`);
  console.log(`  Remaining quota    : ~${MAX_PER_DAY - totalRequests} (today)`);
  console.log(`  To resume          : node Backend/harvestNews.js`);
  console.log('════════════════════════════════════════════════════\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const getArg  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

harvest({
  from:     getArg('--from')     || null,
  to:       getArg('--to')       || null,
  category: getArg('--category') || null
}).catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
