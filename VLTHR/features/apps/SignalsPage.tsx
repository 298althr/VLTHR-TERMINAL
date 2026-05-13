'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { signalsAdapter } from '@/lib/adapters/signals';
import { SIGNAL, NEWS_ITEM } from '@/schemas';
import { Zap, CloudSun, Radio, TrendingUp, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignalsPage() {
  const [weather, setWeather] = useState<SIGNAL[]>([]);
  const [news, setNews] = useState<NEWS_ITEM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [wData, nData] = await Promise.all([
        signalsAdapter.getWeather(),
        signalsAdapter.getHNTopStories(10)
      ]);
      setWeather(wData);
      setNews(nData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <AppShell title="Signals & Sentiment">
      <div className="flex flex-col gap-6">
        {/* Weather / Commodity Proxies */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CloudSun className="text-accent-orange" size={16} />
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Alt Data (NYC)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {weather.map(s => (
              <div key={s.id} className="glass-thick p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-white/40 text-[8px] uppercase font-bold">{s.label}</span>
                <span className="text-white font-mono text-lg">{s.value}</span>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-[8px] leading-relaxed italic">
            Weather acts as a leading indicator for ag and energy commodities. NYC data used as financial hub proxy.
          </p>
        </div>

        {/* Tech Sentiment (HN) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Radio className="text-accent" size={16} />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Tech Sentiment</span>
            </div>
            <span className="text-white/20 text-[8px] font-mono">Source: HackerNews</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Activity className="text-accent animate-spin" size={24} />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {news.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-liquid p-4 rounded-2xl flex flex-col gap-1 hover:border-accent/30 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-white text-xs font-bold leading-snug">{item.title}</h4>
                    <ExternalLink size={12} className="text-white/20 shrink-0" />
                  </div>
                  <span className="text-white/40 text-[8px] font-mono">{item.summary}</span>
                </motion.a>
              ))}
            </div>
          )}
        </div>

        {/* WSB Notice */}
        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-accent-red" size={14} />
            <span className="text-white/60 text-[10px] font-bold">Social Intelligence</span>
          </div>
          <p className="text-white/30 text-[9px] leading-relaxed">
            Direct Reddit sentiment analysis (WallStreetBets) is temporarily offline due to API gateway changes. Using HackerNews as proxy for tech-sector social signals.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
