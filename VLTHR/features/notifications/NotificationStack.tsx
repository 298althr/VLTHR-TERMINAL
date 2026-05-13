'use client';

import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Notification } from './Notification';

export function NotificationStack() {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="fixed top-4 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {notifications?.map((n) => (
          <div key={n.id} className="w-full flex justify-center pointer-events-auto">
            <Notification 
              id={n.id}
              title={n.title}
              message={n.message}
              icon={n.icon}
              onClear={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
