'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';
import { useEffect, useState } from 'react';
import { Lock, Zap, Globe, Download, Monitor, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// Animated counter hook
function useCounter(target: number, duration: number = 2000, prefix = '', suffix = '') {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { value: `${prefix}${value.toLocaleString()}${suffix}`, start: () => setStarted(true) };
}

// Scanline / noise overlay
function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.035,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

// Ambient orbs
function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Primary blue orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 800,
          height: 800,
          top: '-20%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(0, 113, 227, 0.18) 0%, rgba(0, 113, 227, 0.04) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Green accent orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          bottom: '-10%',
          right: '-8%',
          background: 'radial-gradient(circle, rgba(40, 200, 64, 0.12) 0%, rgba(40, 200, 64, 0.03) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      {/* Subtle cyan orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '40%',
          right: '25%',
          background: 'radial-gradient(circle, rgba(0, 200, 255, 0.07) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 20, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
      />
    </div>
  );
}

// Tick chart sparkline SVG
function SparkLine({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');

  const isPositive = data[data.length - 1] >= data[0];
  const pct = (((data[data.length - 1] - data[0]) / Math.abs(data[0] || 1)) * 100).toFixed(2);

  return (
    <motion.div
      className="flex flex-col gap-1 px-4 py-3 rounded-xl"
      style={{
        background: 'rgba(30, 30, 42, 0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
      whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(245,245,247,0.5)', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <span style={{ fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 10, color: isPositive ? '#28c840' : '#ff5f57' }}>
          {isPositive ? '+' : ''}{pct}%
        </span>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <defs>
          <linearGradient id={`fill-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#28c840' : '#ff5f57'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? '#28c840' : '#ff5f57'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={pts}
          stroke={isPositive ? '#28c840' : '#ff5f57'}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

// Feature card
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      className="group relative flex flex-col gap-3 p-5 rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'rgba(30, 30, 42, 0.60)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px) saturate(160%)',
        boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.08), 0 8px 32px -8px rgba(0,0,0,0.6)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, borderColor: 'rgba(0,113,227,0.3)' }}
    >
      {/* Hover shimmer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,113,227,0.06) 0%, transparent 60%)',
        }}
      />
      <img src={icon} alt={title} className="w-9 h-9 object-contain" />
      <div>
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontSize: 14, fontWeight: 600, color: 'rgba(245,245,247,0.95)', letterSpacing: '-0.01em' }}>
          {title}
        </div>
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', fontSize: 13, color: 'rgba(245,245,247,0.65)', lineHeight: 1.6, marginTop: 4 }}>
          {desc}
        </div>
      </div>
    </motion.div>
  );
}

// Metric badge
function MetricBadge({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        style={{
          fontFamily: '"SF Mono", ui-monospace, monospace',
          fontSize: 26,
          fontWeight: 700,
          color: '#f5f5f7',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          fontSize: 11,
          color: 'rgba(245,245,247,0.4)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

const SPARK_BTC = [42100, 42800, 41900, 43500, 44200, 43800, 45100, 44600, 46300, 47200, 46800, 48100];
const SPARK_SPY = [512, 508, 514, 519, 516, 521, 524, 518, 526, 531, 528, 533];
const SPARK_EUR = [1.071, 1.074, 1.069, 1.077, 1.073, 1.079, 1.082, 1.078, 1.085, 1.083, 1.088, 1.091];

const FEATURES = [
  { icon: '/icons/crypto.png', title: 'Crypto Markets', desc: 'Real-time L2 orderbook depth across 400+ pairs with sub-10ms feed latency.' },
  { icon: '/icons/signals.png', title: 'Alpha Signals', desc: 'Proprietary quant signals with live win-rate tracking and regime filtering.' },
  { icon: '/icons/risklab.png', title: 'Risk Lab', desc: 'Monte Carlo simulations, VaR, CVaR, and drawdown stress tests on-demand.' },
  { icon: '/icons/portfolio.png', title: 'Portfolio X-Ray', desc: 'Multi-asset attribution, factor exposure, and correlation matrix at a glance.' },
  { icon: '/icons/screener.png', title: 'Screener', desc: 'Custom rule-based scanner across equities, forex, and derivatives in real time.' },
  { icon: '/icons/concierge.png', title: 'AI Concierge', desc: 'Context-aware financial assistant that critiques plans before you execute.' },
];

export function LandingPage() {
  const setLanding = useAppStore((s) => s.setLanding);
  const [entered, setEntered] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const { canInstall, isIOS, promptInstall } = usePWAInstall();

  const proceedToApp = () => {
    if (entered) return;
    setEntered(true);
    try { playSound('tap'); } catch {}
    setTimeout(() => setLanding(false), 600);
  };

  const handleEnter = () => {
    if (canInstall) {
      setShowInstall(true);
    } else {
      proceedToApp();
    }
  };

  const handleInstall = async () => {
    await promptInstall();
    setShowInstall(false);
    proceedToApp();
  };

  // Ticker tape data
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
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: '#0a0a10', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
    >
      <NoiseOverlay />
      <AmbientOrbs />

      {/* === VIDEO BACKGROUND === */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/logo.svg"
        >
          <source src="https://res.cloudinary.com/dgz88jxiy/video/upload/v1774275215/5194152d6e6336320208e8d976e40aa9_ripmvb.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* === TICKER TAPE === */}
      <div
        className="relative z-10 w-full overflow-hidden"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,16,0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.div
          className="flex gap-8 whitespace-nowrap py-2 px-4"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        >
          {[...tickers, ...tickers, ...tickers].map((t, i) => (
            <span key={i} className="flex items-center gap-2 shrink-0">
              <span style={{ fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 11, color: 'rgba(245,245,247,0.8)', letterSpacing: '0.06em' }}>
                {t.sym}
              </span>
              <span style={{ fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 11, color: 'rgba(245,245,247,0.9)' }}>
                {t.val}
              </span>
              <span style={{ fontFamily: '"SF Mono", ui-monospace, monospace', fontSize: 10, color: t.pos ? '#28c840' : '#ff5f57' }}>
                {t.chg}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 10 }}>•</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-33px)] overflow-y-auto">
        {/* HERO */}
        <div className="flex flex-col items-center justify-center pt-16 pb-10 px-6 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <img src="/logo.svg" alt="VLTHR" className="h-8 mx-auto opacity-90" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(0,113,227,0.12)',
              border: '1px solid rgba(0,113,227,0.3)',
            }}
          >
            <span style={{ fontSize: 11, color: 'rgba(245,245,247,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live Markets · 400+ Instruments
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(40px, 7vw, 80px)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1.05,
              color: '#f5f5f7',
              maxWidth: 800,
            }}
          >
            VLTHR.
            <br />
            <span style={{ color: '#0071e3' }}>Terminal-grade</span> precision.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(15px, 1.8vw, 19px)',
              color: 'rgba(245,245,247,0.75)',
              maxWidth: 560,
              lineHeight: 1.65,
              marginTop: 20,
            }}
          >
            VLTHR Terminal fuses real-time market data, quant-grade analytics, and AI-driven risk critique — engineered for traders who execute without hesitation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            {/* Primary CTA */}
            <motion.button
              onClick={handleEnter}
              disabled={entered}
              className="relative overflow-hidden px-7 py-3 rounded-full font-semibold text-white"
              style={{
                fontSize: 14,
                background: 'linear-gradient(135deg, #0071e3 0%, #0058b3 100%)',
                boxShadow: '0 0 0 1px rgba(0,113,227,0.4), 0 8px 24px -4px rgba(0,113,227,0.4)',
                letterSpacing: '-0.01em',
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 0 1px rgba(0,113,227,0.6), 0 12px 32px -4px rgba(0,113,227,0.5)' }}
              whileTap={{ scale: 0.97 }}
              animate={entered ? { opacity: 0, scale: 0.95 } : {}}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative z-10">Launch Terminal →</span>
            </motion.button>

          </motion.div>

          {/* Sparklines row */}
          <motion.div
            className="flex gap-3 mt-10 flex-wrap justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <SparkLine data={SPARK_BTC} color="#28c840" label="BTC/USD" />
            <SparkLine data={SPARK_SPY} color="#28c840" label="SPY" />
            <SparkLine data={SPARK_EUR} color="#28c840" label="EUR/USD" />
          </motion.div>
        </div>

        {/* === METRICS STRIP === */}
        <motion.div
          className="mx-6 mb-10 p-6 rounded-2xl flex flex-wrap justify-around gap-6"
          style={{
            background: 'rgba(20, 20, 30, 0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          <MetricBadge value="$2.4B+" label="Daily Volume Tracked" delay={0.6} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
          <MetricBadge value="400+" label="Instruments" delay={0.65} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
          <MetricBadge value="< 10ms" label="Feed Latency" delay={0.7} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />
          <MetricBadge value="99.98%" label="Uptime SLA" delay={0.75} />
        </motion.div>

        {/* === FEATURES GRID === */}
        <div className="px-6 pb-6">
          <motion.p
            className="text-center mb-6"
            style={{ fontSize: 12, color: 'rgba(245,245,247,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Everything in the terminal
          </motion.p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={0.72 + i * 0.06} />
            ))}
          </div>
        </div>

        {/* === FOOTER STRIP === */}
        <motion.div
          className="flex items-center justify-center gap-6 py-5 mt-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {[
            { icon: <Lock size={12} className="text-accent/70" />, label: 'Telegram 2FA' },
            { icon: <Zap size={12} className="text-accent-green/70" />, label: 'Sub-10ms Feeds' },
            { icon: <Globe size={12} className="text-accent/70" />, label: 'Global Markets' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              {b.icon}
              <span style={{ fontSize: 11, color: 'rgba(245,245,247,0.55)', letterSpacing: '0.04em' }}>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* === INSTALL MODAL === */}
      {showInstall && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-6 p-8 rounded-[28px] max-w-sm w-full"
            style={{
              background: 'rgba(30, 30, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.12), 0 24px 64px -12px rgba(0,0,0,0.8)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <button
              onClick={() => { setShowInstall(false); proceedToApp(); }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.15)' }}>
              <Monitor size={32} className="text-accent" />
            </div>

            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-2">Install VLTHR Terminal</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Add VLTHR to your home screen for a native app experience with offline access and instant launch.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button
                onClick={handleInstall}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0071e3 0%, #0058b3 100%)',
                  fontSize: 14,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={16} />
                Install Now
              </motion.button>

              <button
                onClick={() => { setShowInstall(false); proceedToApp(); }}
                className="w-full py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
              >
                Continue in Browser
              </button>
            </div>

            {isIOS && (
              <p className="text-white/40 text-[10px] text-center">
                Tap the share icon in Safari, then "Add to Home Screen"
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
