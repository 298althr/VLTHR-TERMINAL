const fs = require('fs');
const path = require('path');
const db = require('./db');

/**
 * QuotaManager (Cross-Process Edition)
 * Uses a file lock (mkdir) to serialize API consumption across all Node processes.
 * Re-reads db.json inside the lock so every process sees the latest shared state.
 */

const PROVIDER_LIMITS = {
  TWELVE_DATA:   { rpd: 800, rpm: 8 },
  ALPHA_VANTAGE: { rpd: 25, rpm: 5 },
  COINGECKO:     { rpd: 10000, rpm: 30 },
  NEWS_API:      { rpd: 100, rpm: 10 },
  MARKETAUX:     { rpd: 100, rpm: 10 },
  WORLD_BANK:    { rpd: 24000, rpm: 20 }
};

const LOCK_DIR = path.join(process.env.DATA_ROOT || '/app/data', '.quota-lock');
const LOCK_MAX_AGE_MS = 30000; // 30s — longer than max RPM sleep (~7.5s)

class QuotaManager {
  /**
   * Acquire an exclusive cross-process lock using mkdir (atomic on all platforms).
   */
  async _acquireLock(maxWaitMs = 60000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      try {
        fs.mkdirSync(LOCK_DIR, { recursive: false });
        return true;
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;

        // Stale lock check — remove if older than threshold
        try {
          const stats = fs.statSync(LOCK_DIR);
          if (Date.now() - stats.mtimeMs > LOCK_MAX_AGE_MS) {
            fs.rmdirSync(LOCK_DIR);
            continue; // retry immediately
          }
        } catch (e2) {
          continue; // lock vanished, retry
        }
        // Another process holds the lock — wait and retry
        await new Promise(r => setTimeout(r, 100));
      }
    }
    throw new Error('[QuotaManager] Could not acquire lock after 60s');
  }

  _releaseLock() {
    try { fs.rmdirSync(LOCK_DIR); } catch (e) {}
  }

  /**
   * Get fresh shared usage from db.json.
   */
  _readSharedUsage() {
    const data = db.read();
    const today = new Date().toISOString().split('T')[0];

    if (!data.quotaUsage || data.quotaUsage.date !== today) {
      const usage = {
        date: today,
        consumption: {},
        lastRequestTimes: {}
      };
      Object.keys(PROVIDER_LIMITS).forEach(p => {
        usage.consumption[p] = 0;
        usage.lastRequestTimes[p] = 0;
      });
      data.quotaUsage = usage;
      db.write(data);
      return usage;
    }
    // Ensure lastRequestTimes exists for backward compat
    if (!data.quotaUsage.lastRequestTimes) {
      data.quotaUsage.lastRequestTimes = {};
      Object.keys(PROVIDER_LIMITS).forEach(p => {
        data.quotaUsage.lastRequestTimes[p] = 0;
      });
      db.write(data);
    }
    return data.quotaUsage;
  }

  /**
   * Write shared usage back to db.json.
   */
  _writeSharedUsage(usage) {
    const data = db.read();
    data.quotaUsage = usage;
    db.write(data);
  }

  /**
   * Consume one API credit for a provider.
   * @returns {Promise<boolean>} true if allowed, false if daily limit reached
   */
  async consume(provider) {
    const limits = PROVIDER_LIMITS[provider];
    if (!limits) return true;

    await this._acquireLock();
    try {
      while (true) {
        const usage = this._readSharedUsage();
        const now = Date.now();
        const lastTime = usage.lastRequestTimes[provider] || 0;
        const minInterval = (60 * 1000) / limits.rpm;

        // RPM throttle — hold lock while sleeping so no other process can burst
        if (now - lastTime < minInterval) {
          const waitTime = minInterval - (now - lastTime);
          console.warn(`[QuotaManager] RPM limit for ${provider}. Throttling for ${Math.round(waitTime)}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        // RPD check
        if (usage.consumption[provider] >= limits.rpd) {
          console.error(`[QuotaManager] RPD limit REACHED for ${provider}. Access denied.`);
          return false;
        }

        // Consume
        usage.consumption[provider] = (usage.consumption[provider] || 0) + 1;
        usage.lastRequestTimes[provider] = Date.now();
        this._writeSharedUsage(usage);
        return true;
      }
    } finally {
      this._releaseLock();
    }
  }

  getStats() {
    const usage = this._readSharedUsage();
    return Object.keys(PROVIDER_LIMITS).map(p => ({
      provider: p,
      used: usage.consumption[p] || 0,
      limit: PROVIDER_LIMITS[p].rpd,
      remaining: PROVIDER_LIMITS[p].rpd - (usage.consumption[p] || 0)
    }));
  }
}

module.exports = new QuotaManager();
