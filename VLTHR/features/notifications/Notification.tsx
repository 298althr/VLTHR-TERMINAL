'use client';

import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  icon: string;
  onClear: (id: string) => void;
}

export function Notification({ id, title, message, icon, onClear }: NotificationProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ x: 200, opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onClear(id);
        }
      }}
      onClick={() => onClear(id)}
      className="w-full max-w-[360px] glass-thick rounded-[24px] p-4 flex items-center gap-4 shadow-elevated border border-white/10 cursor-pointer active:scale-95 transition-transform"
    >
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner pointer-events-none">
        {icon}
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <h4 className="text-white font-bold text-sm truncate">{title}</h4>
        <p className="text-white/60 text-xs line-clamp-2">{message}</p>
      </div>
    </motion.div>
  );
}
