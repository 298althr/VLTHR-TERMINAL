'use client';

import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';

interface AppIconProps {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function AppIcon({ name, icon, onClick }: AppIconProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={() => {
          playSound('tap');
          onClick();
        }}
        className="w-[66px] h-[66px] waterglass-sphere rounded-[18px] flex items-center justify-center text-white"
    >
        {icon}
      </motion.button>
      {name && (
        <span className="text-white text-[11px] font-medium tracking-tight">
          {name}
        </span>
      )}
    </div>
  );
}
