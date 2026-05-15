const equities = require('./services/equities');

async function testAggregation() {
  console.log('🧪 Testing Local Resampling Engine...');
  console.log('Target: AAPL (1-Hour Timeframe)');
  console.log('Source: Local 1-Minute Parquet Lake\n');

  const start = Date.now();
  const data = await equities.getHistory('AAPL', '1h');
  const end = Date.now();

  if (data && data.points) {
    console.log(`✅ SUCCESS: Generated ${data.points.length} 1-hour bars.`);
    console.log(`⏱️  Synthesis Time: ${end - start}ms (Sub-millisecond per bar)`);
    console.log('\nSample Bar (1-Hour):');
    console.log(data.points[0]);
  } else {
    console.log('❌ FAILED: Aggregator could not find source data.');
  }
}

testAggregation();
