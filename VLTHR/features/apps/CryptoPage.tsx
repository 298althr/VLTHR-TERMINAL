'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { coingeckoAdapter } from '@/lib/adapters/coingecko';
import { newsAdapter } from '@/lib/adapters/news';
import { PRICE_TICK, TIME_SERIES } from '@/lib/schemas';
import { Activity, TrendingUp, TrendingDown, RefreshCcw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const NEWS_CATEGORIES = [
  { id: 'finance', label: 'FINANCE' },
  { id: 'stocks', label: 'STOCKS' },
  { id: 'crypto', label: 'CRYPTO' },
  { id: 'tech', label: 'TECH' },
  { id: 'economy', label: 'ECONOMY' },
];

const TIMEFRAMES = [
  { label: '1M',  value: '1min' },
  { label: '5M',  value: '5min' },
  { label: '15M', value: '15min' },
  { label: '1H',  value: '1h' },
  { label: '4H',  value: '4h' },
  { label: '1D',  value: '1day' },
];

export function CryptoPage() {
  const [coins, setCoins]             = useState<PRICE_TICK[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [livePrices, setLivePrices]   = useState<Record<string, string>>({});
  const [catalog] = useState<string[]>(['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'dogecoin']);

  const [selectedCoin, setSelectedCoin] = useState<PRICE_TICK | null>(null);
  const [interval, setTf]              = useState('1day');
  const [history, setHistory]          = useState<TIME_SERIES | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState('crypto');
  const [news, setNews]               = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // ── Market cap list ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setCoinsLoading(true);
      const data = await coingeckoAdapter.getTopCoins();
      setCoins(data);
      if (data.length > 0 && !selectedCoin) setSelectedCoin(data[0]);
      setCoinsLoading(false);
    };
    load();
    const t = window.setInterval(load, 60000);
    return () => window.clearInterval(t);
  }, []);

  // ── Chart history from parquet ────────────────────────────────────
  useEffect(() => {
    if (!selectedCoin) return;
    const load = async () => {
      setChartLoading(true);
      const sym = `${selectedCoin.symbol.toUpperCase()}_USD`;
      const data = await coingeckoAdapter.getHistory(sym, interval);
      setHistory(data);
      setChartLoading(false);
    };
    load();
  }, [selectedCoin, interval]);

  // ── News from parquet via backend ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setNewsLoading(true);
      const data = await newsAdapter.getMarketNews(activeCategory);
      setNews(data);
      setNewsLoading(false);
    };
    load();
  }, [activeCategory]);

  // ── WebSocket live ticks ──────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${catalog.join(',')}`);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setLivePrices(prev => ({ ...prev, ...data }));
    };
    return () => ws.close();
  }, []);

  return (
    <AppShell title="Markets & News">
      <div className="flex flex-col gap-6">

        {/* ── Chart for selected coin ────────────────────────── */}
        <div className="glass-liquid p-5 rounded-[28px] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Selected</span>
              <h2 className="text-white font-bold text-lg">{selectedCoin?.name ?? '—'}</h2>
            </div>

            {/* Timeframe buttons */}
            <div className="flex bg-white/5 p-1 rounded-xl gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTf(tf.value)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    interval === tf.value
                      ? 'bg-accent text-white shadow'
                      : 'text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {chartLoading && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <RefreshCcw className="text-accent animate-spin" size={20} />
              </div>
            )}
            {history?.points?.length ? (
              <FinancialChart data={history.points} type="line" />
            ) : (
              <span className="text-white/20 text-[10px]">
                {chartLoading ? '' : 'No parquet data for this interval — run harvest first'}
              </span>
            )}
          </div>
        </div>

        {/* ── Live tickers strip ─────────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {coins.map((coin) => {
            const coinId = coin.id || coin.symbol.toLowerCase();
            const wsPrice = livePrices[coinId];
            const displayPrice = wsPrice
              ? parseFloat(wsPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })
              : coin.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '—';
            const changePct = coin.changePct ?? 0;
            return (
              <div key={coinId} className={`glass-liquid px-4 py-3 rounded-2xl flex flex-col gap-1 min-w-[130px] border-b-2 ${changePct >= 0 ? 'border-accent-green/30' : 'border-accent-red/30'}`}>
                <div className="flex items-center gap-2">
                  <Zap size={9} className={`${wsPrice ? 'text-accent animate-pulse' : 'text-white/30'}`} />
                  <span className="text-white/40 text-[8px] uppercase font-bold tracking-widest">{coin.name}</span>
                </div>
                <span className="text-white font-mono text-sm">
                  ${displayPrice}
                </span>
                {coin.changePct !== undefined && (
                  <span className={`text-[9px] font-bold ${changePct >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Market cap table — click to select ────────────── */}
        <div className="glass-liquid rounded-[28px] overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-white font-bold text-sm">Market Cap Rank</h2>
            {coinsLoading && <RefreshCcw className="text-accent animate-spin" size={14} />}
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {coins.map((coin, i) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors w-full text-left ${
                  selectedCoin?.symbol === coin.symbol ? 'bg-accent/10 border-l-2 border-accent' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-[10px]">
                    {coin.symbol[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{coin.name}</span>
                    <span className="text-white/40 text-[10px] font-mono uppercase">{coin.symbol}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-mono text-sm">${coin.price.toLocaleString()}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${coin.changePct >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {coin.changePct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(coin.changePct).toFixed(2)}%
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── News category tabs ─────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold tracking-widest transition-all border shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-accent border-accent text-white shadow-[0_0_16px_rgba(0,122,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── News feed from parquet ─────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
              Latest {activeCategory} news
            </h3>
            {newsLoading && <RefreshCcw className="text-accent animate-spin" size={12} />}
          </div>

          {news.length === 0 && !newsLoading ? (
            <div className="glass-liquid p-5 rounded-[24px] text-center text-white/20 text-[10px]">
              No parquet data yet — run <code className="text-accent">harvestNews.js</code>
            </div>
          ) : (
            news.slice(0, 6).map((item, i) => (
              <motion.a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                key={item.id || i}
                className="glass-liquid p-4 rounded-[22px] flex gap-3 items-start group active:scale-95 transition-all"
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0" alt="" />
                )}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-accent text-[8px] font-bold uppercase tracking-wider truncate">{item.source}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.sentiment === 'positive' ? 'bg-accent-green/20 text-accent-green' :
                        item.sentiment === 'negative' ? 'bg-accent-red/20 text-accent-red' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {item.sentiment}
                      </span>
                      <span className="text-white/20 text-[8px] font-mono">
                        {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-white text-xs font-bold leading-tight group-hover:text-accent transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </motion.a>
            ))
          )}
        </div>

      </div>
    </AppShell>
  );
}
