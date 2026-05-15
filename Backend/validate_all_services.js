require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const equities = require('./services/equities');
const crypto = require('./services/coingecko');
const forex = require('./services/forex');
const macro = require('./services/macro');
const news = require('./services/news');

async function validateAll() {
  console.log('\n🛡️ ALTHR Terminal: Full Backend Service Validation');
  console.log('================================================');

  try {
    // 1. EQUITIES
    console.log('\n[1/6] Validating EQUITIES...');
    const eqPrice = await equities.getPrice('AAPL');
    const eqHist = await equities.getHistory('AAPL', '1h');
    console.log(`   > Price: ${eqPrice ? 'OK' : 'FAIL'}`);
    console.log(`   > History: ${eqHist ? 'OK' : 'FAIL'}`);
    
    if (eqPrice && eqHist) console.log('   ✅ Equities Service: STABLE');
    else throw new Error(`Equities validation failed (Price: ${!!eqPrice}, Hist: ${!!eqHist})`);

    // 2. CRYPTO
    console.log('\n[2/6] Validating CRYPTO...');
    const cryPrice = await crypto.getTopCoins(5);
    const cryHist = await equities.getHistory('BTC/USD', '1h', null, 'crypto'); // FIX: route to data/crypto/
    if (cryPrice && cryHist) console.log('   ✅ Crypto Service: STABLE');
    else throw new Error('Crypto validation failed');

    // 3. FOREX
    console.log('\n[3/6] Validating FOREX...');
    const fxPrice = await forex.getLatestRates();
    const fxHist = await forex.getHistory('USD', 'EUR', 30);
    const fxHist12 = await equities.getHistory('USD/EUR', '1h', null, 'forex'); // FIX: Twelve Data 1m forex
    if (fxPrice && fxHist) console.log('   ✅ Forex Service: STABLE');
    else throw new Error('Forex validation failed');

    // 4. MACRO
    console.log('\n[4/6] Validating MACRO...');
    const gdp = await macro.getIndicator('USA', 'NY.GDP.MKTP.CD');
    const yieldCurve = await macro.getYieldCurve();
    if (gdp && yieldCurve) console.log('   ✅ Macro Service: STABLE');
    else throw new Error('Macro validation failed');

    // 5. NEWS / INTELLIGENCE
    console.log('\n[5/6] Validating NEWS...');
    const marketNews = await news.getMarketNews();
    if (marketNews) console.log('   ✅ News Service: STABLE');
    else throw new Error('News validation failed');

    // 6. STORAGE (PARQUET)
    console.log('\n[6/6] Validating STORAGE ENGINE...');
    const parquetEngine = require('./lib/parquetEngine');
    const testRead = await parquetEngine.readHistory('equities', 'AAPL', '1min');
    if (testRead) console.log('   ✅ Storage Engine: STABLE');
    else throw new Error('Storage Engine validation failed');

    console.log('\n================================================');
    console.log('🏆 ALL SERVICES VALIDATED: SYSTEM IS PRODUCTION-READY');
  } catch (err) {
    console.error(`\n❌ VALIDATION FAILED at current step: ${err.message}`);
    process.exit(1);
  }
}

validateAll();
