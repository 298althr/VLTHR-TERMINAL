import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Zap, Wallet, MessageSquare, Settings, X } from 'lucide-react';
import { AppContentRouter } from './AppContentRouter';

const CARD_CONFIG = [
  { id: 'signals',   title: 'Signal Engine', icon: Zap },
  { id: 'portfolio', title: 'Portfolio',     icon: Wallet },
  { id: 'concierge', title: 'Concierge',     icon: MessageSquare },
  { id: 'settings',  title: 'Settings',      icon: Settings },
];

function SingleDockCard({ card }: { card: typeof CARD_CONFIG[0] }) {
  const isOpen = useAppStore((s) => s.dockCards[card.id]);
  const toggleDockCard = useAppStore((s) => s.toggleDockCard);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[280px] h-[380px] rounded-[32px] glass-dark shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-white/5">
            <div className="flex items-center gap-2">
              <card.icon size={16} className="text-accent" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">{card.title}</span>
            </div>
            <button 
              onClick={() => toggleDockCard(card.id)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Card Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-black/20 relative">
            <div className="p-0 h-full origin-top scale-[0.9] w-[111.1%] -ml-[5.55%]">
               <AppContentRouter appId={card.id} />
            </div>
          </div>
          
          <div className="h-4" /> {/* Balanced bottom margin */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockCards() {
  return (
    <div className="fixed bottom-[110px] left-0 right-0 flex justify-center items-end gap-4 px-6 z-[80] pointer-events-none">
      {CARD_CONFIG.map((card) => (
        <SingleDockCard key={card.id} card={card} />
      ))}
    </div>
  );
}
