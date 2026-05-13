import { create } from 'zustand';

interface AppState {
  // Lock state
  isLocked: boolean;
  enteredPin: string;
  pinError: boolean;
  correctPin: string;

  // Navigation
  activeScreen: 'lockscreen' | 'home' | 'notifications' | 'app';
  activeApp: 'crypto' | 'forex' | 'news' | 'macro' | 'equities' | 'signals' | 'portfolio' | 'settings' | null;

  // Dynamic Island
  islandExpanded: boolean;
  islandMessage: string;

  // Notifications
  notifications: Array<{ id: string; title: string; message: string; icon: string }>;

  // Actions
  appendPin: (digit: string) => void;
  clearPin: () => void;
  unlock: () => void;
  lock: () => void;
  setScreen: (screen: AppState['activeScreen']) => void;
  openApp: (app: AppState['activeApp']) => void;
  closeApp: () => void;
  toggleIsland: () => void;
  setIslandExpanded: (val: boolean) => void;
  setIslandMessage: (msg: string) => void;
  addNotification: (n: AppState['notifications'][0]) => void;
  removeNotification: (id: string) => void;
  
  hasSentWelcome: boolean;
  setSentWelcome: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLocked: true,
  enteredPin: '',
  pinError: false,
  correctPin: '1234',

  activeScreen: 'lockscreen',
  activeApp: null,

  islandExpanded: false,
  islandMessage: "ALTHR TERMINAL",

  notifications: [],
  hasSentWelcome: false,

  appendPin: (digit) => {
    const current = get().enteredPin + digit;
    if (current.length === 4) {
      if (current === get().correctPin) {
        set({ enteredPin: current, pinError: false });
        setTimeout(() => get().unlock(), 300);
      } else {
        set({ enteredPin: current, pinError: true });
        setTimeout(() => set({ enteredPin: '', pinError: false }), 600);
      }
    } else {
      set({ enteredPin: current });
    }
  },
  clearPin: () => set({ enteredPin: '', pinError: false }),
  unlock: () => set({ isLocked: false, activeScreen: 'home', enteredPin: '' }),
  lock: () => set({ isLocked: true, activeScreen: 'lockscreen', enteredPin: '', activeApp: null }),
  setScreen: (screen) => set({ activeScreen: screen }),
  openApp: (app) => set({ activeApp: app, activeScreen: 'app' }),
  closeApp: () => set({ activeApp: null, activeScreen: 'home' }),
  toggleIsland: () => set((s) => ({ islandExpanded: !s.islandExpanded })),
  setIslandExpanded: (val) => set({ islandExpanded: val }),
  setIslandMessage: (msg) => set({ islandMessage: msg }),
  addNotification: (n) => set((s) => {
    if (s.notifications.some(notif => notif.id === n.id)) return s;
    return { notifications: [n, ...s.notifications] };
  }),
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  setSentWelcome: (val) => set({ hasSentWelcome: val }),
}));
