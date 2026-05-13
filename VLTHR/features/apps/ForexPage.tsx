'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { forexAdapter } from '@/lib/adapters/forex';
import { PRICE_TICK, TIME_SERIES } from '@/lib/schemas';
import { Activity, Globe, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const MAJORS = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'HKD'];

export function ForexPage() {
  const [rates, setRates] = useState<PRICE_TICK[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('USD/EUR');
  const [history, setHistory] = useState<TIME_SERIES | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      const data = await forexAdapter.getLatestRates('USD', MAJORS);
      setRates(data);
      setLoading(false);
    };

    fetchRates();
    const interval = setInterval(fetchRates, 1800000); // 30 mins as per RULES.md
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setChartLoading(true);
      const [base, quote] = selectedPair.split('/');
      const data = await forexAdapter.getHistory(base, quote, 30);
      setHistory(data);
      setChartLoading(false);
    };

    fetchHistory();
  }, [selectedPair]);

  return (
    <AppShell title="Forex Board">
      <div className="flex flex-col gap-6">
        {/* Selected Pair Chart */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Selected Pair</span>
              <h2 className="text-white font-bold text-xl">{selectedPair}</h2>
            </div>
            {history?.points?.length ? (
              <div className="flex flex-col items-end">
                <span className="text-white font-mono text-lg">
                  {history.points[history.points.length - 1].c.toFixed(4)}
                </span>
                <span className="text-accent-green text-[10px] font-bold">Live FX</span>
              </div>
            ) : null}
          </div>

          <div className="h-[200px] w-full flex items-center justify-center relative">
            {chartLoading && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <RefreshCcw className="text-accent animate-spin" size={24} />
              </div>
            )}
            {history?.points?.length ? (
              <FinancialChart data={history.points} type="line" />
            ) : (
              <div className="text-white/20 text-xs">No historical data</div>
            )}
          </div>
        </div>

        {/* Currency Grid */}
        <div className="flex flex-col gap-3">
          <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-2">Major Pairs (Base: USD)</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Activity className="text-accent animate-spin" size={24} />
              <span className="text-white/40 text-[10px] font-mono">Updating exchange rates...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rates.map((rate, index) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPair(rate.symbol)}
                  key={rate.symbol}
                  className={`p-4 rounded-[24px] flex flex-col gap-2 text-left transition-all ${
                    selectedPair === rate.symbol ? 'glass-thick border-accent/50' : 'glass-liquid'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Globe size={16} />
                    </div>
                    <span className="text-white/40 text-[8px] font-mono">{rate.source}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{rate.symbol}</span>
                    <span className="text-white font-mono text-xs">{rate.price.toFixed(4)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Cross Rate Info */}
        <div className="glass-liquid p-5 rounded-[28px] flex flex-col gap-3">
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Market Status</span>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-white text-xs">Global FX Markets Open</span>
          </div>
          <p className="text-white/40 text-[10px] leading-relaxed">
            Forex data is sourced from European Central Bank (ECB) official rates and commercial providers. Rates update every 30 minutes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
