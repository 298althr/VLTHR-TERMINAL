# Technical Handoff: The Ortho-M8 OS Engine

## 🏗 Core Architecture
The system is built as a **Single Page Application (SPA)** within Next.js 16 to ensure zero latency between "app" transitions. 

### 1. The Central Brain (`/store/useAppStore.ts`)
We use **Zustand** for global state. This is more than just a store; it's the OS kernel.
- **Deduplication Logic**: We implemented a custom `addNotification` wrapper that prevents React key collisions by checking existing IDs before appending.
- **Island State**: The `islandExpanded` boolean is the master switch for the most complex animations in the app.

### 2. Custom Dynamic Island (`/features/dynamic-island/Island.tsx`)
Because standard libraries were too restrictive, we built a custom "Island" using `framer-motion` variants.
- **The "isSmall" Sync**: We used the `AnimatePresence` pattern to ensure that "large" content (like the System Active message) is physically unmounted before the pill shrinks, preventing text "bleed-through."
- **Performance**: The background uses a CSS-only `linear-gradient` animation (`bg-island-animated`) to keep GPU usage low while maintaining a "living" look.

### 3. Responsive Safe Areas (`/features/apps/AppShell.tsx`)
The OS accounts for the Dynamic Island's physical space. 
- **The Logic**: All internal app pages are wrapped in an `AppShell` that provides a consistent `pt-10` (top padding) safe zone. This ensures that the Island never overlaps with navigation buttons.

### 4. Interactive Toggles (`/features/apps/PrivacyPage.tsx`)
To achieve the iOS look, we avoided standard CSS checkboxes.
- **The Implementation**: A custom `Toggle` component using `motion.div` for the thumb. 
- **Color Fix**: We used explicit hex values (`#0a84ff`) and `rgba` overlays to ensure the "ON" state pops correctly against the blurred glass backgrounds.

## 📁 Critical File Map
- **`/app/page.tsx`**: The entry point. Handles the unlock sequence and the 5-second Island alert timer.
- **`/features/home/HomeScreen.tsx`**: The app grid. Uses a 4-column layout optimized for the iPhone 15 Pro viewport.
- **`/public/manifest.json`**: The PWA configuration. Critical for the "standalone" experience.
- **`/public/sounds`**: Contains `tap.mp3` and `unlock.mp3` for tactile audio feedback.

## ⚠️ Notes for Future Development
- **Mock Data**: Most charts and lists are currently hardcoded for the demo.
- **Sound Engine**: Uses a simple `HTMLAudioElement` wrapper in `/lib/audio.ts`. For more complex soundscapes, consider the Web Audio API.
- **Strict Typing**: The project is 100% Type-Safe. Ensure `as const` is used for any new Framer Motion variants to avoid build-time errors.
