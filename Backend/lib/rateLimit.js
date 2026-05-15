const stats = new Map();

module.exports = {
  increment: (provider, limit) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${provider}_${today}`;
    
    let count = stats.get(key) || 0;
    
    if (count >= limit) {
      console.warn(`[BACKEND] Rate limit reached for ${provider}`);
      return false;
    }

    stats.set(key, count + 1);
    return true;
  },

  getStats: (provider) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${provider}_${today}`;
    return { count: stats.get(key) || 0 };
  }
};
