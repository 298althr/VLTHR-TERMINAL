'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export function SessionGuard() {
  const { isLocked, lock, lastActivity, updateActivity } = useAppStore();

  useEffect(() => {
    if (isLocked) return;

    // Track activity
    const handleActivity = () => {
      updateActivity();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Check for timeout
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_LIMIT) {
        console.log('Session expired due to inactivity');
        lock();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(interval);
    };
  }, [isLocked, lastActivity, updateActivity, lock]);

  return null;
}
