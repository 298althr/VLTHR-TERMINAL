'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { coingeckoAdapter } from '@/lib/adapters/coingecko';
import { PRICE_TICK } from '@/lib/schemas';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function CryptoPage() {
  const [coins, setCoins] = useState<PRICE_TICK[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await coingeckoAdapter.getTopCoins(15);
      setCoins(data);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell title="Crypto Market">
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Activity className="text-accent animate-spin" size={32} />
            <span className="text-white/40 text-xs font-mono">Fetching market data...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {coins.map((coin, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={coin.symbol}
                className="glass-liquid p-4 rounded-[24px] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-xs">
                    {coin.symbol[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{coin.name}</span>
                    <span className="text-white/40 text-[10px] font-mono">{coin.symbol}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-white font-mono text-sm">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${coin.changePct >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {coin.changePct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(coin.changePct).toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
