const equities = require('./services/equities');
const fs = require('fs');
const path = require('path');

async function validateSynthesisMatrix() {
  console.log('🏁 ALTHR Terminal: Synthesis Matrix Validation');
  console.log('==============================================');

  const symbols = ['AAPL', 'MSFT', 'TSLA'];
  const timeframes = ['5min', '15min', '1h', '4h'];

  for (const symbol of symbols) {
    console.log(`\n🔎 Auditing ${symbol}...`);
    
    for (const tf of timeframes) {
      console.log(`  > Timeframe: ${tf}`);
      const data = await equities.getHistory(symbol, tf);
      
      if (data && data.points && data.points.length > 0) {
        console.log(`    ✅ SUCCESS: ${data.points.length} bars.`);
        
        // Check if file was saved
        const filePath = path.join(__dirname, `../data/equities/${symbol}/${tf}/history.parquet`);
        if (fs.existsSync(filePath)) {
          console.log(`    💾 CACHE: Successfully saved to ${tf}/history.parquet`);
        }
      } else {
        console.log(`    ❌ FAILED: No data for ${tf}`);
      }
    }
  }

  console.log('\n==============================================');
  console.log('✅ Validation Matrix Complete.');
}

validateSynthesisMatrix().catch(console.error);
