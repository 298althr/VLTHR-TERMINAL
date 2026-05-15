'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchFromBackend } from '@/lib/api';
import { playSound } from '@/lib/audio';

export function usePriceAlerts() {
  const { addNotification } = useAppStore();

  useEffect(() => {
    const checkAlerts = async () => {
      const data = await fetchFromBackend('/api/alerts/check');
      if (data && data.triggered && data.triggered.length > 0) {
        data.triggered.forEach((alert: any) => {
          addNotification({
            id: Date.now().toString(),
            appId: 'signals', // Added appId to fix TypeScript error
            title: 'Price Alert Triggered',
            message: `${alert.symbol} has crossed ${alert.threshold}`,
            icon: 'Zap',
            timestamp: Date.now() // Added timestamp to fix TypeScript error
          });
          playSound('notification');
        });
      }
    };

    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [addNotification]);
}
