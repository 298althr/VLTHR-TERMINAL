'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { newsAdapter } from '@/lib/adapters/news';
import { catalogAdapter } from '@/lib/adapters/catalog';
import { NEWS_ITEM } from '@/lib/schemas';
import { Newspaper, Activity, Search, ExternalLink, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_CATEGORIES = ['finance', 'stocks', 'crypto', 'tech', 'economy'];

export function NewsPage() {
  const [catalog, setCatalog]     = useState<string[]>([]);
  const [articles, setArticles]   = useState<NEWS_ITEM[]>([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('finance');

  useEffect(() => {
    catalogAdapter.getCatalog().then(c => setCatalog(c.news));
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const data = await newsAdapter.getMarketNews(category);
      setArticles(data);
      setLoading(false);
    };
    fetchNews();
  }, [category]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      setIsSearchMode(false);
      return;
    }
    setIsSearchMode(true);
    setLoading(true);
    const data = await newsAdapter.search(q.trim(), category);
    setArticles(data);
    setLoading(false);
  };

  return (
    <AppShell title="Terminal News">
      <div className="flex flex-col gap-6">
        {/* Search Bar */}
        <div className="glass-liquid p-4 rounded-[24px] flex items-center gap-3">
          <Search size={18} className="text-white/40" />
          <input
            type="text"
            placeholder="Search titles, tickers, topics..."
            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-white/20"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim()) { setIsSearchMode(false); setCategory(category); }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
          />
          {isSearchMode && (
            <button onClick={() => { setSearchQuery(''); setIsSearchMode(false); setCategory(category); }}
              className="text-white/30 hover:text-white text-[10px] font-bold shrink-0">
              CLEAR
            </button>
          )}
        </div>

        {/* Category Toggles */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(catalog.length > 0 ? ALL_CATEGORIES.filter(c => catalog.includes(c)) : ALL_CATEGORIES).map((cat: string) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setIsSearchMode(false); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${
                category === cat && !isSearchMode ? 'bg-accent text-white' : 'glass-liquid text-white/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isSearchMode && (
          <div className="text-white/30 text-[10px] px-1">
            Search results for <span className="text-accent font-bold">"{searchQuery}"</span> in {category}
          </div>
        )}

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
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-white/20 text-xs italic">
                    {isSearchMode ? `No results for "${searchQuery}"` : `No parquet data for "${category}" — run harvestNews.js`}
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Rate Limit Info */}
        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10 mt-4">
          <p className="text-white/20 text-[8px] leading-relaxed">
            TERMINAL ADVISORY: News feed is served from local parquet data lake (data/news/). Data is pre-harvested via harvestNews.js and enriched with QAQC scoring and lexicon sentiment analysis. Search queries run across all monthly parquet partitions for the selected category.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
