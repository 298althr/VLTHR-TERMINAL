'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { coingeckoAdapter } from '@/lib/adapters/coingecko';
import { PRICE_TICK } from '@/lib/schemas';
import { Activity, TrendingUp, TrendingDown, RefreshCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

export function CryptoPage() {
  const [coins, setCoins] = useState<PRICE_TICK[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});

  // Fetch initial data
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      const data = await coingeckoAdapter.getTopCoins();
      setCoins(data);
      setLoading(false);
    };
    fetchInitial();
    const interval = setInterval(fetchInitial, 60000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for Live Ticks (CoinCap)
  useEffect(() => {
    const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,cardano,polkadot');
    
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setLivePrices(prev => ({ ...prev, ...data }));
    };

    return () => ws.close();
  }, []);

  return (
    <AppShell title="Crypto Market">
      <div className="flex flex-col gap-6">
        
        {/* Live Ticker Header */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['bitcoin', 'ethereum', 'solana'].map((id) => (
            <div key={id} className="glass-liquid px-4 py-3 rounded-2xl flex flex-col gap-1 min-w-[120px] border-b-2 border-accent/20">
              <div className="flex items-center gap-2">
                <Zap size={10} className="text-accent animate-pulse" />
                <span className="text-white/40 text-[8px] uppercase font-bold tracking-widest">{id}</span>
              </div>
              <span className="text-white font-mono text-sm">
                ${livePrices[id] ? parseFloat(livePrices[id]).toLocaleString() : '---'}
              </span>
            </div>
          ))}
        </div>

        {/* Market Overview Table */}
        <div className="glass-liquid rounded-[32px] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
            <h2 className="text-white font-bold text-sm">Market Cap Rank</h2>
            <Activity className="text-accent" size={16} />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCcw className="text-accent animate-spin" size={24} />
              <span className="text-white/40 text-[10px] font-mono tracking-widest">SYNCING NODES...</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {coins.map((coin, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={coin.symbol} 
                  className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-[10px]">
                      {coin.symbol[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{coin.name}</span>
                      <span className="text-white/40 text-[10px] font-mono uppercase">{coin.symbol}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-white font-mono text-sm">
                      ${coin.price.toLocaleString()}
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

        {/* Global Stats Card */}
        <div className="glass-liquid p-6 rounded-[32px] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity className="text-white/40" size={14} />
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Network Status</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-white text-xs font-bold">Total Liquidity</span>
              <span className="text-accent-green font-mono text-lg">$2.48T</span>
            </div>
            <div className="h-10 w-20 bg-accent/10 rounded-lg flex items-end gap-0.5 p-1">
              {[4,7,3,8,5,9,6,4].map((h, i) => <div key={i} className="flex-1 bg-accent/40 rounded-t-[1px]" style={{ height: `${h*10}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
