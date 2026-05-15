# ORTHO'M8 OS — Engineer Handoff (One-Shot Build Document)

> **Read this document once, top to bottom. Then build. Don't come back to ask questions — every answer is here.**

---

## What You Are Building

An **iPhone-like operating system experience** running in a web browser. Not a website. Not a dashboard. An **interactive product theatre** for investor demos.

The user visits a URL. They see an iPhone lock screen. They swipe up. They enter a PIN. They land on a home screen with app icons. They tap icons to open pages. They pull down a notification center to navigate. A Dynamic Island lives at the top.

**Product name:** ORTHO'M8 OS
**Tagline:** *"A preview of intelligent digital identity systems"*
**Audience:** Investors viewing on their phones during a pitch or via a shared link
**Primary device:** iPhone Safari (this is the #1 priority target)
**Budget:** $0 — all tools are free, hosted on Vercel free tier

---

## The Non-Negotiables

These five things must be flawless. If any of them are mediocre, the demo fails:

1. **Lock screen realism** — must look like a real iPhone lock screen, not a web page
2. **Animation smoothness** — 60fps, spring physics, no abrupt transitions
3. **First interaction latency** — under 200ms response to first tap
4. **Visual depth** — blur, shadows, translucency on every surface
5. **Mobile-first** — must work perfectly on iPhone Safari before anything else

---

## Technology Stack (Exact Versions)

```json
{
  "framework": "next@latest (App Router, NOT Pages Router)",
  "language": "TypeScript (strict mode)",
  "styling": "Tailwind CSS v3+",
  "animation": "framer-motion@latest",
  "state": "zustand@latest",
  "ios-components": "konsta@latest",
  "dynamic-island": "react-live-island@latest",
  "device-frame": "devices.css (copy into project, not npm)"
}
```

**Do not add any other dependencies.** This stack covers 100% of what the MVP needs.

---

## State Model (Zustand Store)

This is the entire application state. One store. No context providers. No Redux.

```typescript
// store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  // Lock state
  isLocked: boolean;
  enteredPin: string;
  pinError: boolean;
  correctPin: string;

  // Navigation
  activeScreen: 'lockscreen' | 'home' | 'notifications' | 'app';
  activeApp: 'home-page' | 'about' | 'contact' | 'privacy' | null;

  // Dynamic Island
  islandExpanded: boolean;
  islandMessage: string;

  // Actions
  appendPin: (digit: string) => void;
  clearPin: () => void;
  unlock: () => void;
  lock: () => void;
  setScreen: (screen: AppState['activeScreen']) => void;
  openApp: (app: AppState['activeApp']) => void;
  closeApp: () => void;
  toggleIsland: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLocked: true,
  enteredPin: '',
  pinError: false,
  correctPin: '1234', // Demo PIN — not security

  activeScreen: 'lockscreen',
  activeApp: null,

  islandExpanded: false,
  islandMessage: 'ORTHO\'M8 OS',

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
}));
```

**This is the complete state model.** Do not add more state until the MVP ships.

---

## File-by-File Build Order

Build in exactly this order. Each file depends only on files built before it.

### Batch 1: Foundation

| # | File | Purpose |
|---|------|---------|
| 1 | `store/useAppStore.ts` | State store (code above) |
| 2 | `styles/globals.css` | Dark theme, font stack, touch overrides, glass utility classes |
| 3 | `app/layout.tsx` | Root layout — viewport meta, font imports, body class |
| 4 | `app/page.tsx` | Single-page app shell — renders active screen based on store |

### Batch 2: Lock Screen

| # | File | Purpose |
|---|------|---------|
| 5 | `features/lockscreen/LockScreen.tsx` | Full-viewport lock screen with video + blur overlay |
| 6 | `features/lockscreen/Clock.tsx` | Live time + date display |
| 7 | `features/lockscreen/SwipeIndicator.tsx` | "Swipe up to unlock" with drag gesture |
| 8 | `features/lockscreen/PinPad.tsx` | 3×3+1 number grid with dot indicators |
| 9 | `lib/audio.ts` | Web Audio API utility — preload + play tap sounds |

### Batch 3: Home Screen

| # | File | Purpose |
|---|------|---------|
| 10 | `features/home/HomeScreen.tsx` | App grid layout + dock bar |
| 11 | `features/home/AppIcon.tsx` | Individual app icon with press animation |
| 12 | `features/dynamic-island/Island.tsx` | Wrapper around react-live-island |

### Batch 4: Navigation + Content

| # | File | Purpose |
|---|------|---------|
| 13 | `features/notifications/NotificationCenter.tsx` | Pull-down card stack |
| 14 | `features/notifications/NotificationCard.tsx` | Individual notification card |
| 15 | `features/apps/AppShell.tsx` | App page wrapper with back navigation |
| 16 | `features/apps/HomePage.tsx` | Product overview page |
| 17 | `features/apps/AboutPage.tsx` | ORTHO'M8 philosophy page |
| 18 | `features/apps/ContactPage.tsx` | Investor CTA page |
| 19 | `features/apps/PrivacyPage.tsx` | Privacy policy page |

### Batch 5: Desktop Wrapper

| # | File | Purpose |
|---|------|---------|
| 20 | `components/DeviceFrame.tsx` | Wraps entire app in devices.css iPhone frame on desktop |

**Total: 20 files.** That's the entire application.

---

## Animation Specifications

Every animation in the app uses spring physics. **No `ease-in-out`. No `linear`. Springs only.**

### Global Spring Preset

```typescript
// Use this everywhere unless specified otherwise
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};
```

### Animation Table

| Interaction | Property | From | To | Duration/Spring | Notes |
|-------------|----------|------|----|-----------------|-------|
| **Swipe up to unlock** | `y` | `0` | `-screenHeight` | `stiffness: 400, damping: 35` | Threshold: 100px drag distance to trigger |
| **PIN dot appear** | `scale` | `0` | `1` | `stiffness: 500, damping: 25` | Bounce effect on each digit |
| **PIN error shake** | `x` | `0` | `[-10, 10, -10, 10, 0]` | `duration: 0.4` | Keyframe animation, exception to spring rule |
| **Lock → Home transition** | `scale, opacity` | `1, 1` | `1.1, 0` → `0.95, 0` → `1, 1` | `stiffness: 300, damping: 30` | Lock screen scales up + fades, home fades in |
| **App icon press** | `scale` | `1` | `0.9` | `stiffness: 400, damping: 20` | On `whileTap` |
| **App open** | `scale, opacity, borderRadius` | `0.8, 0, 20` | `1, 1, 0` | `stiffness: 250, damping: 28` | Full-page takeover from icon position |
| **App close (back)** | `scale, opacity` | `1, 1` | `0.9, 0` | `stiffness: 300, damping: 30` | Reverse of open |
| **Notification slide down** | `y, opacity` | `-100, 0` | `0, 1` | `stiffness: 200, damping: 25` | Stagger: 50ms between each card |
| **Dynamic Island expand** | `width, height, borderRadius` | `120, 36, 18` | `340, 200, 24` | `stiffness: 350, damping: 30` | Use Framer Motion `layout` prop |
| **Dynamic Island collapse** | reverse of expand | — | — | same spring | — |

---

## CSS Design Tokens

```css
/* styles/globals.css — paste these as CSS custom properties */

:root {
  /* Colors — iOS dark mode palette */
  --bg-primary: #000000;
  --bg-secondary: #1c1c1e;
  --bg-tertiary: #2c2c2e;
  --bg-glass: rgba(255, 255, 255, 0.08);
  --bg-glass-thick: rgba(255, 255, 255, 0.15);

  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-tertiary: rgba(255, 255, 255, 0.3);

  --accent: #0a84ff;        /* iOS blue */
  --accent-green: #30d158;  /* iOS green */
  --accent-red: #ff453a;    /* iOS red */
  --accent-orange: #ff9f0a; /* iOS orange */

  /* Blur values */
  --blur-light: blur(10px);
  --blur-medium: blur(20px);
  --blur-heavy: blur(40px);

  /* Shadows */
  --shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-elevated: 0 16px 48px rgba(0, 0, 0, 0.5);

  /* Typography */
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
  --font-mono: "SF Mono", ui-monospace, monospace;

  /* Spacing (iOS 8pt grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

/* Critical body styles */
body {
  font-family: var(--font-system);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: contain;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Glass surface utility */
.glass {
  background: var(--bg-glass);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-thick {
  background: var(--bg-glass-thick);
  backdrop-filter: var(--blur-heavy);
  -webkit-backdrop-filter: var(--blur-heavy);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

---

## Pre-Solved Breakpoints & Failure Modes

> These are the exact problems you **will** hit. The solutions are already here. Don't debug — just apply the fix.

### ❌ Breakpoint 1: Video won't autoplay on iOS Safari

**Symptom:** Lock screen background is black. No video.

**Fix:** The `<video>` tag MUST have all three attributes: `muted`, `playsInline`, `autoPlay`. Missing even one and iOS blocks playback.

```tsx
<video
  autoPlay
  muted
  playsInline
  loop
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/video/lockscreen-bg.mp4" type="video/mp4" />
</video>
{/* Always render a CSS gradient fallback behind the video */}
<div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
```

**The gradient MUST be behind the video** (rendered first or with lower `z-index`). If video fails, the gradient shows. Never a white/blank screen.

---

### ❌ Breakpoint 2: `backdrop-filter` doesn't work or causes jank

**Symptom:** Glass effects look like solid gray rectangles. Or the page drops to 15fps.

**Fix:** iOS Safari requires the `-webkit-` prefix. Always declare both:

```css
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

If performance is still bad, **reduce the number of overlapping glass surfaces**. You cannot have 3 stacked `backdrop-filter` elements. Maximum 2 at any time.

---

### ❌ Breakpoint 3: Swipe gesture fights with browser pull-to-refresh

**Symptom:** Swiping down on home screen triggers Safari's pull-to-refresh instead of the notification center.

**Fix:** Already in the global CSS:

```css
body {
  overscroll-behavior: contain;
  touch-action: none;
}
```

If that isn't enough, add to the root div:

```tsx
<div
  onTouchMove={(e) => e.preventDefault()}
  style={{ touchAction: 'none' }}
>
```

---

### ❌ Breakpoint 4: Web Audio API — "The AudioContext was not allowed to start"

**Symptom:** Console warning. No sound plays.

**Fix:** Browsers require a user gesture before audio can play. Create the AudioContext lazily:

```typescript
// lib/audio.ts
let audioContext: AudioContext | null = null;
const buffers: Record<string, AudioBuffer> = {};

export async function initAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  // Preload sounds
  const sounds = { tap: '/sounds/tap.mp3', unlock: '/sounds/unlock.mp3' };
  for (const [name, url] of Object.entries(sounds)) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    buffers[name] = await audioContext.decodeAudioData(data);
  }
}

export function playSound(name: string) {
  if (!audioContext || !buffers[name]) return;
  if (audioContext.state === 'suspended') audioContext.resume();
  const source = audioContext.createBufferSource();
  source.buffer = buffers[name];
  source.connect(audioContext.destination);
  source.start(0);
}
```

Call `initAudio()` on the **first user interaction** (the swipe-up or first PIN tap). Not on page load.

---

### ❌ Breakpoint 5: Framer Motion `AnimatePresence` not animating exits

**Symptom:** Components disappear instantly instead of animating out.

**Fix:** Three requirements for exit animations:
1. `<AnimatePresence>` must wrap the conditional render
2. The child `<motion.div>` must have a unique `key` prop
3. The `exit` prop must be defined on the motion component

```tsx
<AnimatePresence mode="wait">
  {activeScreen === 'lockscreen' && (
    <motion.div
      key="lockscreen"           // ← Required
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}  // ← Required
      transition={spring}
    >
      <LockScreen />
    </motion.div>
  )}
</AnimatePresence>
```

---

### ❌ Breakpoint 6: Konsta UI components look wrong / unstyled

**Symptom:** Konsta components render but look like generic HTML.

**Fix:** Konsta requires its provider at the root and the `ios` theme:

```tsx
// app/layout.tsx
import { App } from 'konsta/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <App theme="ios" dark>
          {children}
        </App>
      </body>
    </html>
  );
}
```

Also ensure Konsta's Tailwind plugin is in `tailwind.config.js`:

```javascript
const konstaConfig = require('konsta/config');

module.exports = konstaConfig({
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  // ... your config
});
```

---

### ❌ Breakpoint 7: iPhone notch / Dynamic Island overlaps your UI

**Symptom:** Content hidden behind the camera notch on real iPhone.

**Fix:** Use `env(safe-area-inset-top)` in your top-level layout:

```css
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

And in `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

---

### ❌ Breakpoint 8: Desktop view looks stretched / wrong aspect ratio

**Symptom:** App fills the entire desktop browser — looks absurd on a 27" monitor.

**Fix:** On desktop viewports (> 768px), wrap the entire app in the `devices.css` iPhone frame:

```tsx
// components/DeviceFrame.tsx
'use client';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!isDesktop) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="device device-iphone-14-pro">
        <div className="device-frame">
          <div className="device-content" style={{ overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        <div className="device-stripe" />
        <div className="device-header" />
        <div className="device-sensors" />
        <div className="device-btns" />
        <div className="device-power" />
      </div>
    </div>
  );
}
```

On mobile: full viewport, no frame. On desktop: centered iPhone mockup. This is how Apple's own demos work.

---

## Content for App Pages

Use this exact copy. Don't write lorem ipsum. Don't leave placeholders.

### Home Page
```
Title: "Welcome to ORTHO'M8"
Subtitle: "Intelligent digital identity, reimagined"

Section 1 — What Is This?
"ORTHO'M8 is an AI-powered operating system layer that gives every user 
a secure, intelligent digital identity. Think of it as the brain behind 
your digital life — managing, protecting, and optimizing everything you do online."

Section 2 — Key Metrics (mock)
• 12,000+ early access signups
• 3 patent-pending technologies
• Seed round: seeking $1.5M
```

### About Page
```
Title: "The ORTHO'M8 Philosophy"

"We believe digital identity should be owned, not rented.
Every person deserves an AI that works for them — not for advertisers,
not for platforms, not for data brokers.

ORTHO'M8 OS is the foundation layer. An intelligent system that learns
your patterns, protects your data, and acts on your behalf. 

This demo is a taste of what's coming."
```

### Contact Page
```
Title: "Let's Talk"
Subtitle: "Interested in ORTHO'M8? We'd love to hear from you."

CTA Button: "Book a Demo" → mailto link or calendly placeholder
CTA Button: "Investor Deck" → link (can be #)
Email: contact@orthom8.com (or placeholder)
```

### Privacy Page
```
Title: "Your Privacy Matters"

"This demo does not collect, store, or transmit any personal data.
No cookies. No tracking. No analytics.

The PIN you enter is processed entirely in your browser and is not 
sent to any server. ORTHO'M8 is committed to privacy-first design."
```

---

## Asset Checklist

Source these **before** you start coding:

| Asset | Format | Max Size | Source |
|-------|--------|----------|--------|
| Lock screen background video | `.mp4` (H.264) | 2 MB | [Pexels](https://pexels.com/search/videos/abstract%20dark/) — search "abstract dark" |
| Tap sound | `.mp3` | 50 KB | [mixkit.co](https://mixkit.co/free-sound-effects/click/) — search "soft click" |
| Unlock sound | `.mp3` | 100 KB | [mixkit.co](https://mixkit.co/free-sound-effects/notification/) — search "success notification" |
| Notification sound | `.mp3` | 50 KB | [freesound.org](https://freesound.org) — search "iOS notification" |
| App icons | Emoji or SVG | — | Use emoji initially: 🏠 ℹ️ 📬 🔒 |

> [!IMPORTANT]
> Use emoji for app icons in the MVP. Custom-designed icons are Phase 2. Emoji renders natively on iOS and looks perfectly fine in an iOS-style grid.

---

## Deploy Process (Vercel)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "ORTHO'M8 OS — MVP"
git remote add origin https://github.com/YOUR_USERNAME/orthom8-os.git
git push -u origin main

# 2. Go to vercel.com → Import Project → Select the repo
# 3. Framework preset: Next.js (auto-detected)
# 4. Click Deploy
# 5. Live URL: https://orthom8-os.vercel.app
```

No environment variables needed. No build configuration. Vercel auto-detects Next.js.

---

## The Golden Rules

1. **Ship ugly, then polish.** Get all 5 screens working with zero styling before adding a single animation.
2. **Test on iPhone after every major feature.** Not at the end. After every phase.
3. **The lock screen IS the product.** If you run out of time, a perfect lock screen + home screen is better than 5 mediocre screens.
4. **Springs, not easings.** Every animation uses spring physics. No exceptions.
5. **Glass on everything.** If a surface doesn't have `backdrop-filter: blur()`, it's wrong.
6. **No backend. No API calls. No database.** Everything is static. The moment you add a server, you've over-engineered it.
7. **The PIN is `1234`.** It's demo theatre. Don't overthink it.

---

**End of Handoff. Build it.**
