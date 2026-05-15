require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const cliProgress = require('cli-progress');
const equities = require('./services/equities');
const macro = require('./services/macro');
const quotaManager = require('./lib/quotaManager');

/**
 * ALTHR Terminal: Deep Harvester
 * Orchestrates full-spectrum data ingestion with progress visualization.
 * FIXES applied (Audit 2026-05-13):
 * - Crypto/Forex now routed through equities service with correct category
 *   to write real 1m OHLCV data to data/crypto/ and data/forex/ instead
 *   of mis-filing to data/equities/.
 * - Synthesis step explicitly triggers 5m, 15m, 1h, 4h aggregation for ALL
 *   symbols after 1m backfill, not just the 3 previously tested.
 */

const SYMBOLS = {
  EQUITIES: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX', 'INTC'],
  CRYPTO: [
    { id: 'bitcoin',  symbol: 'BTC/USD' },
    { id: 'ethereum', symbol: 'ETH/USD' },
    { id: 'solana',   symbol: 'SOL/USD' },
    { id: 'ripple',   symbol: 'XRP/USD' },
    { id: 'cardano',  symbol: 'ADA/USD' },
    { id: 'polkadot', symbol: 'DOT/USD' },
    { id: 'dogecoin', symbol: 'DOGE/USD' },
  ],
  FOREX: [
    { base: 'USD', quote: 'EUR' },
    { base: 'USD', quote: 'GBP' },
    { base: 'USD', quote: 'JPY' },
    { base: 'USD', quote: 'CHF' },
    { base: 'USD', quote: 'CAD' },
    { base: 'USD', quote: 'AUD' }
  ],
  MACRO: [
    { country: 'USA', indicators: ['NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS', 'BN.CAB.XOKA.GD.ZS'] },
    { country: 'CHN', indicators: ['NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS'] },
    { country: 'EUU', indicators: ['NY.GDP.MKTP.CD', 'FP.CPI.TOTL.ZG'] }
  ]
};

const newsParquet = require('./lib/newsParquet');
const snapshotParquet = require('./lib/snapshotParquet');
const news = require('./services/news');
const coingecko = require('./services/coingecko');

const SYNTHESIS_TFS = ['5min', '15min', '1h', '4h'];

async function runHarvest() {
  console.log('\n🚀 ALTHR Terminal: Deep History Harvesting Initialized');
  console.log('--------------------------------------------------');
  const stats = await quotaManager.getStats();
  const td = stats.find(s => s.provider === 'TWELVE_DATA');
  console.log(`⚠️  QUOTA CHECK: ${td.used}/${td.limit} Twelve Data credits used today.`);
  console.log(`     Estimated need: ~${(SYMBOLS.EQUITIES.length + SYMBOLS.CRYPTO.length + SYMBOLS.FOREX.length) * 21} API calls for deep backfill.`);
  console.log('     Proceed only if remaining credits are sufficient.\n');

  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {percentage}% | {value}/{total} | {module} - {symbol}'
  }, cliProgress.Presets.shades_grey);

  /* 
  // ─────────────────────────────────────────────
  // 1. EQUITIES (Daily + 1Min Deep Reach)
  // SKIPPING: Already harvested.
  // ─────────────────────────────────────────────
  const eqBar = multibar.create(SYMBOLS.EQUITIES.length * 21, 0, { module: 'EQUITIES', symbol: 'INIT' });
  for (const s of SYMBOLS.EQUITIES) {
    eqBar.update(eqBar.value, { symbol: `${s} (1d)` });
    await equities.getHistory(s, '1day');
    eqBar.increment();

    let lastBatchEnd = null;
    for (let p = 0; p < 20; p++) {
      eqBar.update(eqBar.value, { symbol: `${s} (1m-Batch ${p+1}/20)` });
      const data = await equities.getHistory(s, '1min', lastBatchEnd);
      if (data && data.points && data.points.length > 0) {
        const oldestBar = data.points[0];
        const d = new Date(oldestBar.t);
        lastBatchEnd = d.toISOString().replace('T', ' ').split('.')[0];
      }
      eqBar.increment();
    }
  }

  // ─────────────────────────────────────────────
  // 2. CRYPTO (Twelve Data 1min — real OHLCV)
  // SKIPPING: Already harvested.
  // ─────────────────────────────────────────────
  const cryBar = multibar.create(SYMBOLS.CRYPTO.length * 21, 0, { module: 'CRYPTO  ', symbol: 'INIT' });
  for (const s of SYMBOLS.CRYPTO) {
    const symbol = s.symbol; 
    cryBar.update(cryBar.value, { symbol: `${s.id} (1d)` });
    await equities.getHistory(symbol, '1day', null, 'crypto');
    cryBar.increment();

    let lastBatchEnd = null;
    for (let p = 0; p < 20; p++) {
      cryBar.update(cryBar.value, { symbol: `${s.id} (1m-Batch ${p+1}/20)` });
      const data = await equities.getHistory(symbol, '1min', lastBatchEnd, 'crypto');
      if (data && data.points && data.points.length > 0) {
        const oldestBar = data.points[0];
        const d = new Date(oldestBar.t);
        lastBatchEnd = d.toISOString().replace('T', ' ').split('.')[0];
      }
      cryBar.increment();
    }
  }

  // ─────────────────────────────────────────────
  // 3. FOREX (Twelve Data 1min — real OHLCV)
  // SKIPPING: Already harvested.
  // ─────────────────────────────────────────────
  const fxBar = multibar.create(SYMBOLS.FOREX.length * 21, 0, { module: 'FOREX   ', symbol: 'INIT' });
  for (const f of SYMBOLS.FOREX) {
    const symbol = `${f.base}/${f.quote}`; 
    fxBar.update(fxBar.value, { symbol: `${symbol} (1d)` });
    await equities.getHistory(symbol, '1day', null, 'forex');
    fxBar.increment();

    let lastBatchEnd = null;
    for (let p = 0; p < 20; p++) {
      fxBar.update(fxBar.value, { symbol: `${symbol} (1m-Batch ${p+1}/20)` });
      const data = await equities.getHistory(symbol, '1min', lastBatchEnd, 'forex');
      if (data && data.points && data.points.length > 0) {
        const oldestBar = data.points[0];
        const d = new Date(oldestBar.t);
        lastBatchEnd = d.toISOString().replace('T', ' ').split('.')[0];
      }
      fxBar.increment();
    }
  }
  */

  // ─────────────────────────────────────────────
  // 4. MACRO (Long-term)
  // ─────────────────────────────────────────────
  const totalMacro = SYMBOLS.MACRO.reduce((acc, m) => acc + m.indicators.length, 0);
  const macroBar = multibar.create(totalMacro, 0, { module: 'MACRO   ', symbol: 'INIT' });
  for (const m of SYMBOLS.MACRO) {
    for (const ind of m.indicators) {
      macroBar.update(macroBar.value, { symbol: `${m.country}:${ind}` });
      await macro.getIndicator(m.country, ind);
      macroBar.increment();
    }
  }

  // ─────────────────────────────────────────────
  // 5. NEWS (Harvest by category)
  // ─────────────────────────────────────────────
  const newsCategories = ['finance', 'stocks', 'crypto', 'tech', 'economy'];
  const newsBar = multibar.create(newsCategories.length, 0, { module: 'NEWS    ', symbol: 'INIT' });
  for (const cat of newsCategories) {
    newsBar.update(newsBar.value, { symbol: cat });
    await news.getMarketNews(cat); 
    newsBar.increment();
  }

  // ─────────────────────────────────────────────
  // 6. SNAPSHOTS (Crypto + Equities)
  // ─────────────────────────────────────────────
  const snapBar = multibar.create(2, 0, { module: 'SNAPSHOT', symbol: 'INIT' });
  
  // Crypto Snapshot (CoinGecko)
  snapBar.update(0, { symbol: 'Crypto Top 50' });
  const topCoins = await coingecko.getTopCoins();
  if (topCoins && topCoins.length > 0) {
    const items = topCoins.map(c => ({
      symbol: c.symbol.toUpperCase(),
      price: c.price,
      change_1d: c.change24h,
      change_pct: c.change24h,
      market_cap: c.marketCap,
      volume: c.volume24h,
      category: 'crypto'
    }));
    await snapshotParquet.saveSnapshot('crypto', items);
  }
  snapBar.increment();

  // Equities Snapshot (Twelve Data for the symbols we track)
  snapBar.update(1, { symbol: 'Equities Watchlist' });
  const eqItems = [];
  for (const s of SYMBOLS.EQUITIES) {
    const priceData = await equities.getPrice(s);
    if (priceData) {
      eqItems.push({
        symbol: s,
        price: priceData.price,
        change_1d: priceData.change,
        change_pct: priceData.changePct,
        market_cap: 0, // Quote doesn't have market cap
        volume: priceData.volume,
        category: 'equities'
      });
    }
  }
  if (eqItems.length > 0) {
    await snapshotParquet.saveSnapshot('equities', eqItems);
  }
  snapBar.increment();

  multibar.stop();

  // ─────────────────────────────────────────────
  // 5. SYNTHESIS STEP (explicitly trigger for ALL symbols)
  //    Previously only AAPL/MSFT/TSLA had synthesized timeframes because
  //    the JIT aggregator only runs when getHistory(?, tf) is called.
  // ─────────────────────────────────────────────
  console.log('\n🔧 Phase 2: Synthesizing higher timeframes from 1m base...');
  const synBar = new cliProgress.SingleBar({
    format: ' {bar} | {percentage}% | {value}/{total} | Synthesis: {symbol} {tf}'
  }, cliProgress.Presets.shades_grey);

  const synTasks = [];
  // Equities
  for (const s of SYMBOLS.EQUITIES) {
    for (const tf of SYNTHESIS_TFS) synTasks.push({ symbol: s, tf, category: 'equities' });
  }
  // Crypto
  for (const s of SYMBOLS.CRYPTO) {
    for (const tf of SYNTHESIS_TFS) synTasks.push({ symbol: s.symbol, tf, category: 'crypto' });
  }
  // Forex
  for (const f of SYMBOLS.FOREX) {
    const symbol = `${f.base}/${f.quote}`;
    for (const tf of SYNTHESIS_TFS) synTasks.push({ symbol, tf, category: 'forex' });
  }

  synBar.start(synTasks.length, 0, { symbol: 'INIT', tf: '' });
  for (const task of synTasks) {
    synBar.update(synBar.value, { symbol: task.symbol, tf: task.tf });
    await equities.getHistory(task.symbol, task.tf, null, task.category);
    synBar.increment();
  }
  synBar.stop();

  console.log('\n✅ Deep Harvest + Synthesis Complete.');
  console.log(`   Equities: ${SYMBOLS.EQUITIES.length} symbols × 5 timeframes`);
  console.log(`   Crypto:   ${SYMBOLS.CRYPTO.length} symbols × 5 timeframes`);
  console.log(`   Forex:    ${SYMBOLS.FOREX.length} pairs × 5 timeframes`);
  console.log(`   Macro:    ${totalMacro} indicators`);
  console.log('--------------------------------------------------\n');
}

runHarvest().catch(err => {
  console.error('\n❌ Harvest Failed:', err.message);
  process.exit(1);
});
