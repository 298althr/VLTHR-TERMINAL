'use client';

import { motion } from 'framer-motion';
import {
  Lock, Moon, Maximize2, Minimize2, RefreshCw, Settings2,
  Bell, Wifi, Signal, BatteryFull, TrendingUp, TrendingDown,
  Newspaper, Zap, ShieldCheck, Activity
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect, useCallback } from 'react';
import { fetchFromBackend } from '@/lib/api';

interface ControlCentreProps {
  onClose: () => void;
}

export function ControlCentre({ onClose }: ControlCentreProps) {
  const { lock, openWindow, notifications } = useAppStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live widget data
  const [topCrypto, setTopCrypto] = useState<{ name: string; change: number } | null>(null);
  const [newsHeadline, setNewsHeadline] = useState<{ title: string; source: string; time: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadWidgetData = async () => {
      const [crypto, news] = await Promise.all([
        fetchFromBackend('/api/crypto/top'),
        fetchFromBackend('/api/news'),
      ]);
      if (crypto && crypto.length > 0) {
        const btc = crypto.find((c: any) => c.symbol === 'BTC' || c.id === 'bitcoin') || crypto[0];
        setTopCrypto({ name: btc.symbol || btc.name, change: btc.price_change_percentage_24h || btc.change || 0 });
      }
      if (news && news.length > 0) {
        const latest = news[0];
        setNewsHeadline({
          title: latest.title || latest.headline || 'Markets update incoming...',
          source: latest.source || 'VLTHR Feed',
          time: latest.publishedAt ? new Date(latest.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
        });
      }
    };
    loadWidgetData();
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchFromBackend('/api/crypto/top');
    setTimeout(() => setIsRefreshing(false), 1200);
  }, [isRefreshing]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const activeSignals = notifications.filter(n => n.appId === 'signals').length;
  const marketUp = (topCrypto?.change ?? 0) >= 0;

  return (
    <>
      {/* Backdrop click to close */}
      <div className="fixed inset-0 z-[150]" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        className="fixed top-7 right-0 bottom-0 w-[360px] z-[160] flex flex-col gap-3 p-4 overflow-hidden"
        style={{
          background: 'rgba(8, 8, 18, 0.72)',
          backdropFilter: 'blur(70px) saturate(220%)',
          WebkitBackdropFilter: 'blur(70px) saturate(220%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── STATUS BAR ── */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-2 text-white/40">
            <Signal size={11} />
            <Wifi size={11} />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase">VLTHR Live</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="text-[10px]">100%</span>
            <BatteryFull size={11} />
          </div>
        </div>

        {/* ── CLOCK WIDGET ── */}
        <div
          className="rounded-[26px] p-5 relative overflow-hidden shrink-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.72) 100%), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          />
          <div className="relative flex flex-col gap-1">
            <span className="text-white/35 text-[9px] font-black uppercase tracking-[0.5em]">Local Time</span>
            <div className="text-white text-[38px] font-thin tracking-tighter leading-none" suppressHydrationWarning>{time}</div>
            <div className="text-white/45 text-[12px] font-light tracking-wide" suppressHydrationWarning>{date}</div>
          </div>
        </div>

        {/* ── CONTROLS GRID ── */}
        <div className="grid grid-cols-4 gap-2 shrink-0">

          {/* Lock — 2 cols */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => { lock(); onClose(); }}
            className="col-span-2 rounded-[20px] p-3.5 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.16)' }}
          >
            <div className="w-9 h-9 rounded-full bg-red-500/25 flex items-center justify-center shrink-0">
              <Lock size={15} className="text-red-300" />
            </div>
            <div className="text-left">
              <div className="text-white text-[12px] font-semibold leading-tight">Lock</div>
              <div className="text-white/35 text-[10px]">Secure session</div>
            </div>
          </motion.button>

          {/* Focus Mode — 2 cols */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setFocusMode(!focusMode)}
            className="col-span-2 rounded-[20px] p-3.5 flex items-center gap-3 transition-colors duration-300"
            style={{
              background: focusMode ? 'rgba(139,92,246,0.32)' : 'rgba(255,255,255,0.06)',
            }}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${focusMode ? 'bg-purple-500/35' : 'bg-white/08'}`}>
              <Moon size={15} className={focusMode ? 'text-purple-300' : 'text-white/60'} />
            </div>
            <div className="text-left">
              <div className="text-white text-[12px] font-semibold leading-tight">Focus</div>
              <div className="text-white/35 text-[10px]">{focusMode ? 'DND Active' : 'Off'}</div>
            </div>
          </motion.button>

          {/* Square controls — 4 across */}
          {[
            {
              icon: isFullscreen ? Minimize2 : Maximize2,
              label: isFullscreen ? 'Exit' : 'Full',
              action: toggleFullscreen,
              active: isFullscreen,
              activeColor: 'rgba(59,130,246,0.4)',
            },
            {
              icon: RefreshCw,
              label: 'Sync',
              action: handleRefresh,
              active: isRefreshing,
              activeColor: 'rgba(16,185,129,0.4)',
            },
            {
              icon: Bell,
              label: 'Alerts',
              action: () => { openWindow('signals' as any, 'Signals'); onClose(); },
              active: activeSignals > 0,
              activeColor: 'rgba(251,191,36,0.4)',
              badge: activeSignals > 0 ? activeSignals : null,
            },
            {
              icon: Settings2,
              label: 'Settings',
              action: () => { openWindow('settings' as any, 'Settings'); onClose(); },
              active: false,
              activeColor: 'rgba(255,255,255,0.25)',
            },
          ].map((ctrl) => {
            const Icon = ctrl.icon;
            return (
              <motion.button
                key={ctrl.label}
                whileTap={{ scale: 0.88 }}
                onClick={ctrl.action}
                className="rounded-[18px] p-2.5 flex flex-col items-center justify-center gap-1 aspect-square relative transition-colors duration-200"
                style={{
                  background: ctrl.active ? ctrl.activeColor : 'rgba(255,255,255,0.065)',
                }}
              >
                <Icon
                  size={19}
                  className={`text-white/75 ${ctrl.label === 'Sync' && isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="text-white/45 text-[9px] font-medium tracking-wide">{ctrl.label}</span>
                {(ctrl as any).badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">{(ctrl as any).badge}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ── WIDGETS ── */}
        <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">

          {/* Market Pulse */}
          <div
            className="rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 100%), url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=60')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-[9px] font-black uppercase tracking-wider">Markets</span>
              {marketUp ? <TrendingUp size={11} className="text-green-400" /> : <TrendingDown size={11} className="text-red-400" />}
            </div>
            <div>
              <div className={`text-[24px] font-semibold leading-none tracking-tight ${marketUp ? 'text-green-400' : 'text-red-400'}`}>
                {topCrypto ? `${marketUp ? '+' : ''}${topCrypto.change.toFixed(1)}%` : '—'}
              </div>
              <div className="text-white/25 text-[10px] mt-1">{topCrypto?.name ?? 'BTC'} · 24h</div>
            </div>
          </div>

          {/* Active Signals */}
          <div
            className="rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 100%), url('https://images.unsplash.com/photo-1699625789794-90ceb687e9f5?q=80&w=880&auto=format&fit=crop&q=50')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Circuit-line texture */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,1) 10px)', backgroundSize: '100% 10px' }}
            />
            <div className="flex items-center justify-between relative">
              <span className="text-white/35 text-[9px] font-black uppercase tracking-wider">Signals</span>
              <Zap size={11} className="text-yellow-400" />
            </div>
            <div className="relative">
              <div className="text-yellow-400 text-[24px] font-semibold leading-none tracking-tight">{activeSignals || '—'}</div>
              <div className="text-white/25 text-[10px] mt-1">Active alerts</div>
            </div>
          </div>

          {/* Portfolio P&L */}
          <div
            className="rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 100%), url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-[9px] font-black uppercase tracking-wider">Portfolio</span>
              <ShieldCheck size={11} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-indigo-300 text-[24px] font-semibold leading-none tracking-tight">+$12.4K</div>
              <div className="text-white/25 text-[10px] mt-1">Today's P&L</div>
            </div>
          </div>

          {/* Risk Lab */}
          <div
            className="rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 100%), url('https://images.unsplash.com/photo-1518715058720-e56f02e77fe5?w=300&auto=format&fit=crop&q=50')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-[9px] font-black uppercase tracking-wider">Risk Score</span>
              <Activity size={11} className="text-pink-400" />
            </div>
            <div>
              <div className="text-pink-400 text-[24px] font-semibold leading-none tracking-tight">7.2</div>
              <div className="text-white/25 text-[10px] mt-1">Moderate risk</div>
            </div>
          </div>

          {/* News Headline — full width */}
          <div
            className="col-span-2 rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.82) 100%), url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=60')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle horizontal scan-line */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 3px)' }}
            />
            <div className="flex items-center justify-between mb-2 relative">
              <span className="text-white/35 text-[9px] font-black uppercase tracking-wider">Live News</span>
              <Newspaper size={11} className="text-white/30" />
            </div>
            <p className="text-white/70 text-[12px] leading-snug line-clamp-2 relative">
              {newsHeadline?.title ?? 'Fetching latest market headlines...'}
            </p>
            <div className="text-white/25 text-[10px] mt-2 relative">
              {newsHeadline ? `${newsHeadline.source} · ${newsHeadline.time}` : '—'}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
