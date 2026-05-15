'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { equitiesAdapter } from '@/lib/adapters/equities';
import { catalogAdapter } from '@/lib/adapters/catalog';
import { PRICE_TICK, TIME_SERIES, FUNDAMENTAL } from '@/lib/schemas';
import { LineChart, Activity, Search, TrendingUp, TrendingDown, Star, BarChart3, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const TIMEFRAMES = [
  { label: '1M',  value: '1min' },
  { label: '5M',  value: '5min' },
  { label: '15M', value: '15min' },
  { label: '1H',  value: '1h' },
  { label: '4H',  value: '4h' },
  { label: '1D',  value: '1day' },
];

export function EquitiesPage() {
  const [catalog, setCatalog] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [interval, setInterval]            = useState('1day');
  const [quote, setQuote] = useState<PRICE_TICK | null>(null);
  const [history, setHistory] = useState<TIME_SERIES | null>(null);
  const [fundamentals, setFundamentals] = useState<FUNDAMENTAL | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    catalogAdapter.getCatalog().then(c => setCatalog(c.equities));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, f] = await Promise.all([
          equitiesAdapter.getPrice(selectedSymbol),
          equitiesAdapter.getFundamentals(selectedSymbol)
        ]);
        setQuote(p);
        setFundamentals(f);
      } catch (e) {
        console.error('Equities Page Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSymbol]);

  useEffect(() => {
    const fetchHistory = async () => {
      setChartLoading(true);
      try {
        const h = await equitiesAdapter.getHistory(selectedSymbol, interval);
        setHistory(h);
      } catch (e) {
        console.error('Equities History Error:', e);
      } finally {
        setChartLoading(false);
      }
    };
    fetchHistory();
  }, [selectedSymbol, interval]);

  return (
    <AppShell title="Equities Panel">
      <div className="flex flex-col gap-6">
        {/* Symbol Search */}
        <div className="glass-liquid p-4 rounded-[24px] flex items-center gap-3">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Enter Ticker (e.g. NVDA, TSLA)..."
            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-white/20 uppercase"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search) setSelectedSymbol(search.toUpperCase());
            }}
          />
        </div>

        {/* Price Detail Card */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Star size={18} className="text-white/20" />
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                {quote?.source || 'MARKET'} · {fundamentals?.sector || 'SECTOR'}
              </span>
              <h2 className="text-white font-bold text-2xl">{selectedSymbol}</h2>
              <span className="text-white/60 text-xs">{quote?.name || 'Loading Asset Name...'}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-white font-mono text-2xl">
                {quote ? `$${quote.price.toFixed(2)}` : '—'}
              </span>
              {quote && (
                <div className={`flex items-center gap-1 text-[11px] font-bold ${quote.changePct >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {quote.changePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(quote.changePct).toFixed(2)}%
                </div>
              )}
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-white/5 p-1 rounded-xl gap-1 self-start">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setInterval(tf.value)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  interval === tf.value
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart Section */}
          <div className="h-[200px] w-full flex items-center justify-center relative">
            {(loading || chartLoading) && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Activity className="text-accent animate-spin" size={24} />
              </div>
            )}
            {history?.points?.length ? (
              <FinancialChart data={history.points} type="line" />
            ) : !loading && !chartLoading ? (
              <div className="text-white/20 text-xs italic text-center px-10">
                No parquet data for this interval — run harvest or check API key
              </div>
            ) : null}
          </div>
        </div>

        {/* Watchlist Quick-Grid */}
        <div className="flex flex-col gap-3">
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-2">Watchlist</span>
          <div className="grid grid-cols-3 gap-2">
            {catalog.map((sym: string) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`py-3 rounded-2xl text-[10px] font-bold transition-all border ${
                  selectedSymbol === sym ? 'bg-accent text-white border-accent' : 'glass-liquid text-white/40 border-white/5'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Fundamentals Sidebar (Simulated Layout) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-liquid p-4 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-white/30" />
              <span className="text-white/40 text-[9px] uppercase font-bold">Market Cap</span>
            </div>
            <span className="text-white font-mono text-sm">
              {fundamentals?.marketCap ? `$${(fundamentals.marketCap / 1e9).toFixed(2)}B` : '—'}
            </span>
          </div>
          <div className="glass-liquid p-4 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-white/30" />
              <span className="text-white/40 text-[9px] uppercase font-bold">Sector</span>
            </div>
            <span className="text-white text-[11px] font-bold truncate">
              {fundamentals?.sector || '—'}
            </span>
          </div>
        </div>

        {/* Advisory */}
        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10">
          <p className="text-white/20 text-[8px] leading-relaxed">
            SYSTEM NOTICE: Equity data is 15-minute delayed per exchange regulations. Real-time access requires Terminal Tier subscription. Primary source: Twelve Data. Fallback: Alpha Vantage.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
