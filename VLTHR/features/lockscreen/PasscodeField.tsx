'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';

export function PasscodeField({ onCancel }: { onCancel: () => void }) {
  const { enteredPasscode, setEnteredPasscode, validatePasscode, pinError, isVerifying, requestCode, codeRequested } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [codeRequested]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validatePasscode();
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Authentication</h2>
        <p className="text-white/40 text-sm">Verify your identity via Telegram</p>
      </div>

      {!codeRequested ? (
        <button
          onClick={() => { playSound('tap'); requestCode(); }}
          className="btn-custom-primary w-64 h-14 text-lg"
        >
          Request Code
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <motion.div
            animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={enteredPasscode}
              onChange={(e) => setEnteredPasscode(e.target.value)}
              className={`w-64 bg-white/10 border-2 rounded-2xl px-4 py-4 text-white text-center text-3xl font-mono tracking-[0.5em] outline-none transition-all ${
                pinError ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 focus:border-accent/50 focus:bg-white/15'
              }`}
              placeholder="••••••"
              maxLength={6}
              disabled={isVerifying}
            />
          </motion.div>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="submit"
              disabled={isVerifying || enteredPasscode.length < 6}
              className="btn-custom-primary w-full h-12 text-sm disabled:opacity-30"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Terminal'}
            </button>
            <button
              type="button"
              onClick={() => { playSound('tap'); onCancel(); }}
              className="text-white/30 hover:text-white/60 text-xs font-medium uppercase tracking-widest transition-colors py-2"
            >
              Back to Lock
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
