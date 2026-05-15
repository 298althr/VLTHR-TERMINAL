'use client';

import { AppShell } from './AppShell';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export function TradePage() {
  const stocks = [
    { symbol: 'AAPL', price: '182.41', change: '+1.2%', trend: 'up' },
    { symbol: 'TSLA', price: '174.15', change: '-2.4%', trend: 'down' },
    { symbol: 'NVDA', price: '891.22', change: '+4.5%', trend: 'up' },
  ];

  const crypto = [
    { symbol: 'BTC', price: '64,210', change: '+0.8%', trend: 'up' },
    { symbol: 'ETH', price: '3,450', change: '-1.1%', trend: 'down' },
    { symbol: 'SOL', price: '142', change: '+5.2%', trend: 'up' },
  ];

  const AssetCard = ({ asset }: { asset: any }) => (
    <div className="glass-liquid p-4 rounded-2xl flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-white font-bold text-sm">{asset.symbol}</span>
        <span className="text-white/40 text-[10px] font-mono">${asset.price}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold ${asset.trend === 'up' ? 'text-accent-green' : 'text-accent-red'}`}>
          {asset.change}
        </span>
        {asset.trend === 'up' ? <TrendingUp size={14} className="text-accent-green" /> : <TrendingDown size={14} className="text-accent-red" />}
      </div>
    </div>
  );

  return (
    <AppShell title="Trading & Markets">
      <div className="flex flex-col gap-8">
        <section>
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-widest opacity-40">Equities</h2>
            <ExternalLink size={14} className="text-white/20" />
          </div>
          <div className="flex flex-col gap-3">
            {stocks.map((s, i) => <AssetCard key={i} asset={s} />)}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-widest opacity-40">Digital Assets</h2>
            <ExternalLink size={14} className="text-white/20" />
          </div>
          <div className="flex flex-col gap-3">
            {crypto.map((c, i) => <AssetCard key={i} asset={c} />)}
          </div>
        </section>

        <div className="glass-liquid p-6 rounded-[28px] border border-accent/20 bg-accent/5">
          <h3 className="text-accent font-bold text-xs mb-2">Market Analysis</h3>
          <p className="text-white/60 text-[11px] leading-relaxed">
            Sovereign indices are showing strong support at the 2.4T level. Neural-link sentiment analysis suggests a 14% increase in liquidity for decentralized liquidity pools.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
