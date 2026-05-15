'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';
import { useEffect, useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { checkBackendHealth } from '@/lib/api';

export function LandingPage() {
  const setLanding = useAppStore((s) => s.setLanding);
  const [entered, setEntered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const { canInstall, promptInstall } = usePWAInstall();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Backend connectivity check
  useEffect(() => {
    checkBackendHealth().then(ok => setBackendStatus(ok ? 'online' : 'offline'));
  }, []);

  const handleEnter = async () => {
    if (entered) return;
    setEntered(true);
    try { playSound('tap'); } catch {}
    if (canInstall) {
      await promptInstall();
    }
    setTimeout(() => setLanding(false), 200);
  };

  const tickers = [
    { sym: 'BTC/USD', val: '47,243.80', chg: '+3.12%', pos: true },
    { sym: 'ETH/USD', val: '3,182.40', chg: '+1.87%', pos: true },
    { sym: 'SPY', val: '533.21', chg: '+0.43%', pos: true },
    { sym: 'EUR/USD', val: '1.0912', chg: '-0.08%', pos: false },
    { sym: 'NVDA', val: '924.60', chg: '+2.41%', pos: true },
    { sym: 'GOLD', val: '2,381.50', chg: '-0.22%', pos: false },
    { sym: 'NQ1!', val: '19,047.25', chg: '+0.78%', pos: true },
    { sym: 'GBP/USD', val: '1.2743', chg: '+0.11%', pos: true },
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a10]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      {/* Mouse-following ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 113, 227, 0.07) 0%, transparent 50%)`,
        }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Geometric accent shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[12%] -left-[5%] w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-[15%] -right-[8%] w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
        <div className="absolute top-[45%] right-[18%] w-[200px] h-[200px] rounded-full border border-[#0071e3]/[0.06]" />
      </div>

      {/* Ticker tape */}
      <div className="relative z-10 w-full overflow-hidden border-b border-white/[0.06] bg-[#0a0a10]/90 backdrop-blur-xl">
        <motion.div
          className="flex gap-8 whitespace-nowrap py-2 px-4"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...tickers, ...tickers, ...tickers].map((t, i) => (
            <span key={i} className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] text-white/80 tracking-widest">{t.sym}</span>
              <span className="font-mono text-[11px] text-white/90">{t.val}</span>
              <span className={`font-mono text-[10px] ${t.pos ? 'text-emerald-400' : 'text-red-400'}`}>{t.chg}</span>
              <span className="text-white/10 text-[10px]">•</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-40px)] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <img src="/logo.svg" alt="VLTHR" className="h-8 mx-auto opacity-90" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,113,227,0.12)', border: '1px solid rgba(0,113,227,0.3)' }}
        >
          <span className="text-[11px] text-white/85 tracking-widest uppercase">Live Markets · 400+ Instruments</span>
        </motion.div>

        {/* Backend connectivity status (debug) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-4"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-emerald-400' :
              backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
            }`}
          />
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
            API: {backendStatus}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(40px, 7vw, 80px)', maxWidth: 800 }}
        >
          <span className="text-[#0071e3]">Terminal-grade</span> precision.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-white/70 max-w-lg leading-relaxed"
          style={{ fontSize: 'clamp(15px, 1.8vw, 18px)' }}
        >
          VLTHR Terminal fuses real-time market data, quant-grade analytics, and AI-driven risk critique.
        </motion.p>

        <motion.button
          onClick={handleEnter}
          disabled={entered}
          className="relative mt-10 px-8 py-3 rounded-full font-semibold text-white text-sm"
          style={{
            background: 'linear-gradient(135deg, #0071e3 0%, #0058b3 100%)',
            boxShadow: '0 0 0 1px rgba(0,113,227,0.4), 0 8px 24px -4px rgba(0,113,227,0.4)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={entered ? { opacity: 0, scale: 0.95 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Launch Terminal →
        </motion.button>
      </div>
    </div>
  );
}
