'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Globe, Shield, Zap } from 'lucide-react';
import { playSound } from '@/lib/audio';

export function LandingPage() {
  const setLanding = useAppStore((s) => s.setLanding);

  const handleEnter = () => {
    playSound('tap');
    setLanding(false);
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-accent selection:text-black">
      {/* Background Image with Cinematic Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 animate-slow-zoom"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80')`,
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-black/40 to-black/90 backdrop-blur-[2px]" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <img src="/logo.svg" alt="VLTHR" className="w-24 h-24 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </motion.div>

        <h1 className="text-white text-5xl md:text-7xl font-black uppercase tracking-[0.25em] mb-4 drop-shadow-2xl">
          VLTHR <span className="text-accent">Terminal</span>
        </h1>
        
        <p className="text-white/50 text-sm md:text-base font-light tracking-[0.4em] uppercase mb-12 max-w-2xl leading-relaxed">
          The next generation financial operating system for high-velocity alpha.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnter}
          className="group relative flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-accent"
        >
          Enter System
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20 pointer-events-none" />
        </motion.button>
      </motion.div>

      {/* Footer Features */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-12 left-0 right-0 flex justify-center gap-12 md:gap-24 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} />
          <span>Global Markets</span>
        </div>
        <div className="flex items-center gap-2 text-accent/60">
          <Zap size={14} />
          <span>Zero Latency</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={14} />
          <span>Encrypted Session</span>
        </div>
      </motion.div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
    </div>
  );
}
