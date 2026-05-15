'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  const isLoading = useAppStore((s) => s.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1500] flex items-center justify-center pointer-events-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative w-16 h-16 flex items-center justify-center"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-white/5 blur-xl" />
              
              {/* Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-t-2 border-white/40 border-r-2 border-r-transparent" />
              
              {/* Logo/Icon */}
              <img src="/logo.svg" alt="VLTHR" className="w-8 h-8 opacity-80" />
            </motion.div>
            
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-lg"
            >
              System Processing
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
