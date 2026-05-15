/**
 * Controlled test for harvest category fix.
 * Runs 1 equity + 1 crypto + 1 forex symbol with full 1d + 1m backfill + synthesis.
 * Estimates ~63 API calls (well within remaining quota).
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const equities = require('./services/equities');
const quotaManager = require('./lib/quotaManager');

const TEST_SYMBOLS = {
  equity: 'NVDA',                    // previously missing synthesized TFs
  crypto: { id: 'bitcoin', symbol: 'BTC/USD' },
  forex: { pair: 'USD/EUR' }
};

async function runTest() {
  console.log('\n🧪 ALTHR: Controlled Harvest Test (Category Fix Verification)');
  console.log('==============================================================');

  const statsBefore = await quotaManager.getStats();
  const tdBefore = statsBefore.find(s => s.provider === 'TWELVE_DATA');
  console.log(`\n📊 Quota BEFORE: ${tdBefore.used}/${tdBefore.limit} (${tdBefore.remaining} remaining)`);

  // ── EQUITY TEST ──
  console.log(`\n[1/3] Equity: ${TEST_SYMBOLS.equity}`);
  await equities.getHistory(TEST_SYMBOLS.equity, '1day');
  await equities.getHistory(TEST_SYMBOLS.equity, '1min');
  // Trigger synthesis for missing timeframes
  for (const tf of ['5min', '15min', '1h', '4h']) {
    await equities.getHistory(TEST_SYMBOLS.equity, tf);
  }
  console.log(`   ✅ ${TEST_SYMBOLS.equity} 1d + 1m + synthesis complete`);

  // ── CRYPTO TEST ──
  console.log(`\n[2/3] Crypto: ${TEST_SYMBOLS.crypto.symbol}`);
  await equities.getHistory(TEST_SYMBOLS.crypto.symbol, '1day', null, 'crypto');
  await equities.getHistory(TEST_SYMBOLS.crypto.symbol, '1min', null, 'crypto');
  for (const tf of ['5min', '15min', '1h', '4h']) {
    await equities.getHistory(TEST_SYMBOLS.crypto.symbol, tf, null, 'crypto');
  }
  console.log(`   ✅ ${TEST_SYMBOLS.crypto.symbol} 1d + 1m + synthesis complete (category=crypto)`);

  // ── FOREX TEST ──
  console.log(`\n[3/3] Forex: ${TEST_SYMBOLS.forex.pair}`);
  await equities.getHistory(TEST_SYMBOLS.forex.pair, '1day', null, 'forex');
  await equities.getHistory(TEST_SYMBOLS.forex.pair, '1min', null, 'forex');
  for (const tf of ['5min', '15min', '1h', '4h']) {
    await equities.getHistory(TEST_SYMBOLS.forex.pair, tf, null, 'forex');
  }
  console.log(`   ✅ ${TEST_SYMBOLS.forex.pair} 1d + 1m + synthesis complete (category=forex)`);

  // ── RESULTS ──
  const statsAfter = await quotaManager.getStats();
  const tdAfter = statsAfter.find(s => s.provider === 'TWELVE_DATA');
  console.log('\n==============================================================');
  console.log(`📊 Quota AFTER:  ${tdAfter.used}/${tdAfter.limit} (${tdAfter.remaining} remaining)`);
  console.log(`📈 Calls used in this test: ${tdAfter.used - tdBefore.used}`);
  console.log('==============================================================\n');

  // Check files were written to correct paths
  const fs = require('fs');
  const path = require('path');
  const DATA_ROOT = path.join(__dirname, '../data');

  const checks = [
    { label: 'NVDA 1min (equities)', path: path.join(DATA_ROOT, 'equities', 'NVDA', '1min', 'history.parquet') },
    { label: 'NVDA 5min (equities)', path: path.join(DATA_ROOT, 'equities', 'NVDA', '5min', 'history.parquet') },
    { label: 'BTC/USD 1min (crypto)', path: path.join(DATA_ROOT, 'crypto', 'BTC/USD', '1min', 'history.parquet') },
    { label: 'BTC/USD 5min (crypto)', path: path.join(DATA_ROOT, 'crypto', 'BTC/USD', '5min', 'history.parquet') },
    { label: 'USD/EUR 1min (forex)', path: path.join(DATA_ROOT, 'forex', 'USD/EUR', '1min', 'history.parquet') },
    { label: 'USD/EUR 5min (forex)', path: path.join(DATA_ROOT, 'forex', 'USD/EUR', '5min', 'history.parquet') },
  ];

  console.log('📁 Parquet path verification:');
  for (const c of checks) {
    const exists = fs.existsSync(c.path);
    const size = exists ? fs.statSync(c.path).size : 0;
    console.log(`   ${exists ? '✅' : '❌'} ${c.label}: ${exists ? size + ' bytes' : 'NOT FOUND'}`);
  }
  console.log('');
}

runTest().catch(err => {
  console.error('\n❌ Test Failed:', err.message);
  process.exit(1);
});
