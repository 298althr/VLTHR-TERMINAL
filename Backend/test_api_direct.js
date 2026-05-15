require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const axios = require('axios');
const key = process.env.NEXT_PUBLIC_TWELVE_DATA_KEY;

async function test() {
  const tests = [
    { label: 'BTC/USD 1min', params: { symbol: 'BTC/USD', interval: '1min', apikey: key, outputsize: 2 } },
    { label: 'USD/EUR 1min', params: { symbol: 'USD/EUR', interval: '1min', apikey: key, outputsize: 2 } },
    { label: 'AAPL 1min',    params: { symbol: 'AAPL',    interval: '1min', apikey: key, outputsize: 2 } },
  ];
  for (const t of tests) {
    try {
      const res = await axios.get('https://api.twelvedata.com/time_series', { params: t.params });
      if (res.data.status === 'error') {
        console.log(`${t.label}: ERROR — ${res.data.message}`);
      } else {
        const bars = res.data.values ? res.data.values.length : 0;
        const sample = bars > 0 ? `open=${res.data.values[0].open} close=${res.data.values[0].close}` : 'no values';
        console.log(`${t.label}: OK — ${bars} bars | ${sample}`);
      }
    } catch (e) {
      console.log(`${t.label}: EXCEPTION — ${e.response?.data?.message || e.message}`);
    }
  }
}
test();
