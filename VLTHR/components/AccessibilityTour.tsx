'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ChevronRight, Zap, Settings } from 'lucide-react';

export function AccessibilityTour() {
  const [showTour, setShowTour] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('vlthr-tour-seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowTour(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    localStorage.setItem('vlthr-tour-seen', 'true');
  };

  const steps = [
    {
      title: "Dynamic Island",
      content: "The liquid bar at the top provides real-time system alerts. Click it to expand and manage your notifications.",
      target: "top",
      icon: Zap
    },
    {
      title: "Control Centre",
      content: "Use the icons in the Menu Bar (top right) to access System Settings, Brightness, and Connectivity.",
      target: "top-right",
      icon: Settings
    }
  ];

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      {showTour && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-32 right-10 z-[2000] w-80 glass-dark rounded-3xl p-6 shadow-2xl border border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-accent/20 p-2 rounded-xl">
              <currentStep.icon className="text-accent" size={24} />
            </div>
            <button onClick={dismissTour} className="text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">
            {currentStep.title}
          </h3>
          <p className="text-white/60 text-xs leading-relaxed mb-6">
            {currentStep.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === step ? 'w-4 bg-accent' : 'w-1 bg-white/20'}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : dismissTour()}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-accent transition-colors"
            >
              {step < steps.length - 1 ? 'Next' : 'Got it'}
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
