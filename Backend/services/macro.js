const axios = require('axios');
const cache = require('../lib/cache');
const config = require('../lib/config');

module.exports = {
  getIndicator: async (country = 'USA', indicator = 'NY.GDP.MKTP.CD') => {
    const cacheKey = `macro_${country}_${indicator}`;
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    try {
      const res = await axios.get(`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}`, {
        params: { format: 'json', per_page: 100 }
      });
      const data = res.data;
      if (!data[1]) return null;

      const points = data[1]
        .filter(item => item.value !== null)
        .map(item => ({ date: item.date, value: item.value }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const normalized = {
        indicator: data[1][0].indicator.value,
        country: data[1][0].country.value,
        unit: 'USD',
        frequency: 'Annual',
        points
      };
      cache.set(cacheKey, normalized, config.CACHE_TTLS.MACRO);
      return normalized;
    } catch (e) {
      return cached.data;
    }
  },

  getYieldCurve: async () => {
    const cacheKey = 'yield_curve';
    const cached = cache.get(cacheKey);
    if (cached.data && !cached.isStale) return cached.data;

    try {
      const res = await axios.get(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates`, {
        params: { sort: '-record_date', 'page[size]': 50 }
      });
      const latestDate = res.data.data[0].record_date;
      const filtered = res.data.data.filter(item => item.record_date === latestDate);
      const points = filtered.map(item => ({
        date: item.security_desc,
        value: parseFloat(item.avg_interest_rate_amt)
      }));
      const normalized = { indicator: 'US Treasury Yield Curve', country: 'USA', unit: '%', frequency: 'Daily', points };
      cache.set(cacheKey, normalized, config.CACHE_TTLS.MACRO);
      return normalized;
    } catch (e) {
      return cached.data;
    }
  }
};
