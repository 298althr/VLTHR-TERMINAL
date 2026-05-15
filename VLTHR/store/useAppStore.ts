import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WindowState {
  id: string;          // unique window id
  appId: string;       // maps to app type ('crypto', 'forex', etc.)
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
}

interface AppState {
  // Lock state
  isLocked: boolean;
  isOnLanding: boolean;
  setLanding: (val: boolean) => void;
  enteredPasscode: string;
  pinError: boolean;
  isVerifying: boolean;
  codeRequested: boolean;
  lastRequestTime: number; // 30s throttle

  // Navigation (Legacy support during transition)
  activeScreen: 'lockscreen' | 'home' | 'notifications' | 'app';
  activeApp: 'crypto' | 'forex' | 'news' | 'macro' | 'equities' | 'signals' | 'portfolio' | 'settings' | 'calendar' | 'options' | 'watchlist' | 'screener' | 'risklab' | 'concierge' | 'reports' | null;

  // Window Manager State
  openWindows: WindowState[];
  maxZIndex: number;

  // Dynamic Island
  islandExpanded: boolean;
  islandMessage: string;
  
  // Theme state
  terminalTheme: 'dark' | 'light' | 'nebula';
  terminalBrightness: number;

  // Notifications
  notifications: Array<{ 
    id: string; 
    title: string; 
    message: string; 
    icon: string; 
    appId: string; // 'news', 'signals', 'risklab', etc.
    timestamp: number;
  }>;

  // Actions
  requestCode: () => Promise<void>;
  setEnteredPasscode: (code: string) => void;
  appendPasscode: (char: string) => void;
  clearPasscode: () => void;
  validatePasscode: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  setScreen: (screen: AppState['activeScreen']) => void;
  
  // App Actions
  openApp: (app: AppState['activeApp']) => void; // Legacy
  closeApp: () => void;                          // Legacy

  // Window Actions
  openWindow: (appId: AppState['activeApp'], title: string) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  moveWindow: (windowId: string, pos: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;
  updateWindow: (windowId: string, updates: Partial<WindowState>) => void;

  toggleIsland: () => void;
  setIslandExpanded: (val: boolean) => void;
  setIslandMessage: (msg: string) => void;
  setTerminalTheme: (theme: 'dark' | 'light' | 'nebula') => void;
  setTerminalBrightness: (val: number) => void;
  addNotification: (n: AppState['notifications'][0]) => void;
  removeNotification: (id: string) => void;
  
  hasSentWelcome: boolean;
  setSentWelcome: (val: boolean) => void;

  // Global Loading State
  isLoading: boolean;
  setLoading: (val: boolean) => void;

  // Inactivity Logic
  lastActivity: number;
  updateActivity: () => void;

  // Control Centre
  isControlCentreOpen: boolean;
  setControlCentreOpen: (val: boolean) => void;

  // Launchpad
  isLaunchpadOpen: boolean;
  setLaunchpadOpen: (val: boolean) => void;

  // Dock Cards (Mini-Toggles)
  dockCards: Record<string, boolean>;
  toggleDockCard: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLocked: true,
      isOnLanding: true,
      enteredPasscode: '',
      pinError: false,
      isVerifying: false,
      codeRequested: false,
      lastRequestTime: 0,

      activeScreen: 'lockscreen',
      activeApp: null,

      openWindows: [],
      maxZIndex: 10,

      islandExpanded: false,
      islandMessage: "VLTHR TERMINAL",
      
      terminalTheme: 'dark',
      terminalBrightness: 80,

      notifications: [
        {
          id: 'n1',
          appId: 'news',
          title: 'BTC Breakdown',
          message: 'Bitcoin breaks below $60k support level.',
          icon: 'Newspaper',
          timestamp: Date.now() - 1000 * 60 * 5
        },
        {
          id: 'n2',
          appId: 'news',
          title: 'Fed Rate Update',
          message: 'FOMC minutes suggest rates stay higher for longer.',
          icon: 'Newspaper',
          timestamp: Date.now() - 1000 * 60 * 15
        },
        {
          id: 'n3',
          appId: 'signals',
          title: 'Long Signal: ETH/USD',
          message: 'RSI divergence detected on 4h timeframe.',
          icon: 'Zap',
          timestamp: Date.now() - 1000 * 60 * 2
        },
        {
          id: 'n4',
          appId: 'risklab',
          title: 'Portfolio Alert',
          message: 'Value-at-Risk (VaR) exceeded 5% threshold.',
          icon: 'ShieldCheck',
          timestamp: Date.now() - 1000 * 60 * 60
        },
        {
          id: 'n5',
          appId: 'news',
          title: 'NVIDIA Earnings',
          message: 'NVDA beats expectations with 265% revenue growth.',
          icon: 'Newspaper',
          timestamp: Date.now() - 1000 * 60 * 30
        }
      ],
      hasSentWelcome: false,
      isLoading: false,
      lastActivity: Date.now(),
      isControlCentreOpen: false,
      isLaunchpadOpen: false,

      dockCards: {
        signals: false,
        portfolio: false,
        concierge: false,
        settings: false,
      },

      requestCode: async () => {
        const { lastRequestTime } = get();
        const now = Date.now();
        
        // 30s Throttle check
        if (now - lastRequestTime < 30000) {
          console.warn('Request Code throttled. Wait 30s.');
          return;
        }

        let rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        if (rawUrl.includes('railway.app') && !rawUrl.startsWith('http')) {
          rawUrl = `https://${rawUrl}`;
        }
        const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

        try {
          const res = await fetch(`${baseUrl}/api/auth/request-code`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (data.success) {
            set({ codeRequested: true, lastRequestTime: now });
          }
        } catch (e) {
          console.error('Request Code Error:', e);
        }
      },
      
      setEnteredPasscode: (code) => set({ enteredPasscode: code }),
      
      appendPasscode: (char) => set((s) => {
        const next = s.enteredPasscode + char;
        if (next.length <= 6) {
          return { enteredPasscode: next };
        }
        return s;
      }),

      clearPasscode: () => set({ enteredPasscode: '' }),
      
      validatePasscode: async () => {
        const { enteredPasscode, unlock, setLoading } = get();
        if (get().isVerifying) return;

        set({ isVerifying: true });
        setLoading(true);
        let rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        if (rawUrl.includes('railway.app') && !rawUrl.startsWith('http')) {
          rawUrl = `https://${rawUrl}`;
        }
        const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        
        try {
          const res = await fetch(`${baseUrl}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: enteredPasscode })
          });
          const data = await res.json();
          
          if (data.success) {
            set({ pinError: false, isVerifying: false, codeRequested: false });
            setTimeout(() => {
              setLoading(false);
              unlock();
            }, 800);
          } else {
            set({ pinError: true, isVerifying: false });
            setLoading(false);
            setTimeout(() => set({ pinError: false }), 600);
          }
        } catch (e) {
          console.error('Verify Passcode Error:', e);
          set({ pinError: true, isVerifying: false });
          setLoading(false);
          setTimeout(() => set({ pinError: false }), 600);
        }
      },

      unlock: () => {
        set({ isLocked: false, activeScreen: 'home', enteredPasscode: '' });
        
        // Trigger Dynamic Island on successful unlock
        set({ islandExpanded: true, islandMessage: "TERMINAL SECURE" });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          set({ islandExpanded: false });
        }, 5000);
      },
      lock: () => set({ isLocked: true, activeScreen: 'lockscreen', enteredPasscode: '', activeApp: null }),
      setScreen: (screen) => set({ activeScreen: screen }),
      
      openApp: (app) => set({ activeApp: app, activeScreen: 'app' }),
      closeApp: () => set({ activeApp: null, activeScreen: 'home' }),

      openWindow: (appId, title) => {
        if (!appId) return;
        
        const state = get();
        const existing = state.openWindows.find(w => w.appId === appId);
        
        if (existing) {
          state.focusWindow(existing.id);
          return;
        }

        state.setLoading(true);
        setTimeout(() => {
          const id = `${appId}-${Date.now()}`;
          const newWindow: WindowState = {
            id,
            appId,
            title,
            position: { x: 100 + state.openWindows.length * 40, y: 100 + state.openWindows.length * 40 },
            size: { width: 900, height: 650 },
            isMinimized: false,
            zIndex: state.maxZIndex + 1,
          };
          
          set({
            openWindows: [...state.openWindows, newWindow],
            maxZIndex: state.maxZIndex + 1,
            isLoading: false,
          });
        }, 600);
      },

      closeWindow: (windowId) => set((state) => ({
        openWindows: state.openWindows.filter(w => w.id !== windowId),
      })),

      focusWindow: (windowId) => set((state) => ({
        openWindows: state.openWindows.map(w =>
          w.id === windowId ? { ...w, zIndex: state.maxZIndex + 1, isMinimized: false } : w
        ),
        maxZIndex: state.maxZIndex + 1,
      })),

      minimizeWindow: (windowId) => set((state) => ({
        openWindows: state.openWindows.map(w =>
          w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
        ),
      })),

      moveWindow: (windowId, pos) => set((state) => ({
        openWindows: state.openWindows.map(w =>
          w.id === windowId ? { ...w, position: pos } : w
        ),
      })),

      resizeWindow: (windowId, size) => set((state) => ({
        openWindows: state.openWindows.map(w =>
          w.id === windowId ? { ...w, size } : w
        ),
      })),
      
      updateWindow: (windowId, updates) => set((state) => ({
        openWindows: state.openWindows.map(w =>
          w.id === windowId ? { ...w, ...updates } : w
        ),
      })),

      toggleIsland: () => set((s) => ({ islandExpanded: !s.islandExpanded })),
      setIslandExpanded: (val) => set({ islandExpanded: val }),
      setIslandMessage: (msg) => set({ islandMessage: msg }),
      
      setTerminalTheme: (theme: AppState['terminalTheme']) => set({ terminalTheme: theme }),
      setTerminalBrightness: (val: number) => set({ terminalBrightness: val }),
      
      addNotification: (n) => set((s) => {
        if (s.notifications.some(notif => notif.id === n.id)) return s;
        return { notifications: [n, ...s.notifications] };
      }),
      removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
      setSentWelcome: (val) => set({ hasSentWelcome: val }),
      
      setLanding: (val) => set({ isOnLanding: val }),
      
      setLoading: (val) => set({ isLoading: val }),

      updateActivity: () => set({ lastActivity: Date.now() }),

      setControlCentreOpen: (val) => set({ isControlCentreOpen: val }),

      setLaunchpadOpen: (val) => set({ isLaunchpadOpen: val }),

      toggleDockCard: (id) => set((state) => ({
        dockCards: {
          ...state.dockCards,
          [id]: !state.dockCards[id]
        }
      })),
    }),
    {
      name: 'althr-terminal-storage',
      skipHydration: true,
      partialize: (state) => ({
        isLocked: state.isLocked,
        isOnLanding: state.isOnLanding,
        hasSentWelcome: state.hasSentWelcome,
        openWindows: state.openWindows,
        maxZIndex: state.maxZIndex,
      }),
    }
  )
);
