'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { newsAdapter } from '@/lib/adapters/news';
import { NEWS_ITEM } from '@/lib/schemas';
import { Newspaper, Activity, Search, ExternalLink, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NewsPage() {
  const [articles, setArticles] = useState<NEWS_ITEM[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('finance');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const data = await newsAdapter.getMarketNews(filter);
      setArticles(data);
      setLoading(false);
    };

    fetchNews();
  }, [filter]);

  return (
    <AppShell title="Terminal News">
      <div className="flex flex-col gap-6">
        {/* Search / Filter Bar */}
        <div className="glass-liquid p-4 rounded-[24px] flex items-center gap-3">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search markets, tickers, or macro..."
            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-white/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setFilter(e.currentTarget.value);
            }}
          />
        </div>

        {/* Category Toggles */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['finance', 'stocks', 'crypto', 'tech', 'economy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-accent text-white' : 'glass-liquid text-white/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Activity className="text-accent animate-spin" size={32} />
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Compiling Feed...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {articles.length > 0 ? (
                articles.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-liquid group p-5 rounded-[28px] flex flex-col gap-3 hover:border-accent/40 transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-accent/10 text-accent text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {item.source}
                          </span>
                          {item.sentiment && (
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              item.sentiment === 'positive' ? 'text-accent-green' : 'text-accent-red'
                            }`}>
                              {item.sentiment}
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-sm leading-tight group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <ExternalLink size={14} className="text-white/20 shrink-0 mt-1" />
                    </div>

                    <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-white/20 text-[9px] font-mono">
                          <Calendar size={10} />
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </div>
                        {item.tickers.length > 0 && (
                          <div className="flex items-center gap-1 text-accent text-[9px] font-bold font-mono">
                            <Tag size={10} />
                            {item.tickers.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40 italic text-xs">
                  No news found for "{filter}". Please check your API keys.
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Rate Limit Info */}
        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10 mt-4">
          <p className="text-white/20 text-[8px] leading-relaxed">
            TERMINAL ADVISORY: News feed utilizes a multi-layered fallback system. Primary source is MarketAux (tagged entities), with NewsAPI and GNews as commercial backups. Polling interval: 10 minutes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
