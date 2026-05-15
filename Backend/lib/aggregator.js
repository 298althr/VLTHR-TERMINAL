/**
 * Aggregator Engine
 * Resamples high-resolution (1m) data into higher timeframes (5m, 15m, 1h, 4h, 1D).
 * This eliminates the need for redundant API calls for every timeframe.
 */

module.exports = {
  /**
   * Resamples an array of 1m bars into a target timeframe.
   * @param {Array} bars - Array of {t, o, h, l, c, v}
   * @param {String} targetTf - '5m', '15m', '1h', '4h', '1D'
   */
  aggregate: (bars, targetTf) => {
    if (!bars || bars.length === 0) return [];

    const intervalMs = parseTimeframe(targetTf);
    const buckets = {};

    bars.forEach(bar => {
      // Group by interval start time
      const bucketTime = Math.floor(bar.t / intervalMs) * intervalMs;
      
      if (!buckets[bucketTime]) {
        buckets[bucketTime] = {
          t: bucketTime,
          o: bar.o,
          h: bar.h,
          l: bar.l,
          c: bar.c,
          v: bar.v || 0,
          count: 1
        };
      } else {
        const b = buckets[bucketTime];
        b.h = Math.max(b.h, bar.h);
        b.l = Math.min(b.l, bar.l);
        b.c = bar.c; // Last bar in bucket determines the close
        b.v += (bar.v || 0);
        b.count++;
      }
    });

    return Object.values(buckets).sort((a, b) => a.t - b.t);
  }
};

function parseTimeframe(tf) {
  const units = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    D: 24 * 60 * 60 * 1000
  };
  
  const value = parseInt(tf);
  const unit = tf.slice(-1);
  return value * (units[unit] || units.m);
}
