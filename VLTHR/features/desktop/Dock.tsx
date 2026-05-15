'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  BarChart3, Globe, LineChart, Newspaper, 
  Landmark, Zap, Wallet, Settings,
  Calendar, Layers, Star, Filter, 
  ShieldCheck, MessageSquare, FileText, LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';

const DOCK_ITEMS = [
  { id: 'launchpad', title: 'Launchpad', icon: '/icons/launcher.png', isImage: true },
  { id: 'signals',   title: 'Signal Engine', icon: Zap },
  { id: 'portfolio', title: 'Portfolio',     icon: Wallet },
  { id: 'concierge', title: 'Concierge',     icon: MessageSquare },
  { id: 'settings',  title: 'Settings',      icon: Settings },
  { id: 'logout',    title: 'Logout',        icon: LogOut },
];

function DockItem({ item, mouseX }: { item: typeof DOCK_ITEMS[0], mouseX: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { dockCards, toggleDockCard, lock, isLaunchpadOpen, setLaunchpadOpen } = useAppStore();
  
  const isActive = item.id === 'launchpad' ? isLaunchpadOpen : dockCards[item.id];

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40], { clamp: true });
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const handleClick = () => {
    playSound('tap');
    if (item.id === 'logout') {
      lock();
    } else if (item.id === 'launchpad') {
      setLaunchpadOpen(!isLaunchpadOpen);
    } else {
      toggleDockCard(item.id);
    }
  };

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`relative aspect-square rounded-xl flex items-center justify-center cursor-pointer overflow-hidden ${
        isActive ? 'bg-accent text-black shadow-[0_0_25px_rgba(255,255,0,0.4)]' : 'glass-liquid text-white/90 hover:bg-white/20'
      }`}
    >
      {item.isImage ? (
        <img src={item.icon as string} alt={item.title} className="w-4/5 h-4/5 object-contain" />
      ) : (
        <Icon className="w-1/2 h-1/2" />
      )}
      {isActive && (
        <motion.div 
          layoutId="dock-active-dot"
          className="absolute -bottom-1.5 w-1 h-1 bg-accent rounded-full shadow-[0_0_5px_#fff]"
        />
      )}
    </motion.div>
  );
}

export function Dock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[200] pointer-events-none">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 rounded-2xl glass-dark pointer-events-auto"
        style={{ height: 'auto' }}
      >
        {DOCK_ITEMS.map((item) => (
          <DockItem key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  );
}
