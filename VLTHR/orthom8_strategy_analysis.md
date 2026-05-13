# ORTHO'M8 OS — Strategic Build Analysis

> **Product:** ORTHO'M8 OS — *"A preview of intelligent digital identity systems"*
> **Budget:** $0 — zero spend on tooling, hosting, or assets
> **Builder:** Antigravity AI (no external designer or developer required)
> **Target:** 50 concurrent users max for investor demo

---

## 🎯 The Goal

Build an **interactive investor demo** that looks and feels like an iPhone OS — lock screen, PIN unlock, Dynamic Island, notification-center-as-navigation, and 3–5 "app" pages — all running in a browser.

**Success metric:** An investor opens the link on their phone, sees a lock screen, swipes up, enters a PIN, and within 10 seconds says *"whoa."*

This is **not** a traditional web app. It's a **theatre piece** disguised as software. Antigravity builds the whole thing — no UI/UX designer, no frontend contractor. The handoff document and the AI do the design work.

---

## 🧬 Repo Combination (The Stack)

### Clone & Use Directly

| # | Repo / Package | What It Gives You | How to Get It |
|---|----------------|-------------------|---------------|
| 1 | **Next.js (App Router)** | Framework, routing, SSR, static export | `npx -y create-next-app@latest ./` |
| 2 | **[react-live-island](https://github.com/nanxiaobei/react-live-island)** | Drop-in Dynamic Island with expand/collapse | `npm install react-live-island` |
| 3 | **[picturepan2/devices.css](https://github.com/picturepan2/devices.css)** | Pure CSS iPhone frame for desktop kiosk view | Copy CSS into project |
| 4 | **[Konsta UI](https://konstaui.com)** | iOS-native-feeling lists, cards, navbars | `npm install konsta` |
| 5 | **Framer Motion** | All animations — spring physics, gestures, layout | `npm install framer-motion` |
| 6 | **Zustand** | Lightweight state (lock state, screens, PIN) | `npm install zustand` |

### Study for Patterns Only (Don't Clone)

| Repo | What to Learn |
|------|--------------|
| **[Amooryjubran/iphone-simulator](https://github.com/Amooryjubran/iphone-simulator)** | Home screen grid layout, app-open animation patterns |
| **[amelie-schlueter/dynamic-island-web](https://github.com/amelie-schlueter/dynamic-island-web)** | Framer Motion `layout` prop for island expansion |
| **[tddworks/claude-skills](https://github.com/tddworks/claude-skills)** | Post-MVP only — agent skill patterns for "AI apps" |

> [!NOTE]
> The `claude-skills` repo is irrelevant to the MVP. It contains Claude AI skill definitions for iOS/macOS Tuist development. Useful only in Phase 2 when adding AI agent "apps" to the home screen.

---

## 🏠 Hosting Decision: Vercel Free vs Railway Free

For 50 concurrent users viewing a static/SSR demo, **both are overkill**. Here's the comparison:

| Factor | Vercel Free (Hobby) | Railway Free |
|--------|--------------------:|-------------:|
| **Monthly cost** | $0 | $0 (trial credits) |
| **Bandwidth** | 100 GB/mo | 1 GB egress included |
| **Compute** | Edge functions (serverless) | Container-based (512 MB RAM) |
| **Cold starts** | None (edge-cached static) | Yes — sleeps after 10 min inactivity |
| **Custom domain** | ✅ Free | ✅ Free |
| **Deploy from Git** | ✅ One-click | ✅ One-click |
| **Commercial use** | ❌ Prohibited on free tier | ✅ Allowed |
| **Sleep/spin-down** | Never (static sites stay warm) | Sleeps after inactivity |
| **50 concurrent users** | ✅ No problem | ⚠️ May cold-start on first hit |

### Recommendation

**Use Vercel Free.** For an investor demo (not revenue-generating yet), the Hobby tier is perfect:
- No cold starts — the site is always instant
- 100 GB bandwidth handles thousands of demo sessions
- Zero config — push to GitHub, it deploys
- Free HTTPS + custom subdomain (`orthom8.vercel.app`)

> [!TIP]
> If you later need commercial use rights (charging users, embedding in a paid product), move to Vercel Pro ($20/mo) or switch to Railway. For now, $0 is the right answer.

---

## 💰 Total Cost Breakdown

| Item | Cost |
|------|------|
| Next.js + React | $0 |
| Framer Motion | $0 |
| Zustand | $0 |
| Konsta UI | $0 |
| Tailwind CSS | $0 |
| react-live-island | $0 |
| devices.css | $0 |
| Vercel Hosting (Hobby) | $0/mo |
| Domain (use Vercel subdomain) | $0 |
| Lock screen background video | $0 (Pexels / Pixabay) |
| Sound effects | $0 (freesound.org / mixkit.co) |
| Designer / Developer | $0 (Antigravity builds it) |
| **TOTAL** | **$0** |

---

## 🔒 Security Profile

### Attack Surface

This is a **static frontend with no backend, no database, and no user data**. The attack surface is minimal.

| Vector | Risk | Notes |
|--------|------|-------|
| PIN bypass | 🟡 Cosmetic only | PIN runs in JS — inspectable via DevTools. This is a demo UX element, not real auth. Acceptable. |
| Source code exposure | 🟢 None | It's a frontend. All code is public by nature. Don't embed secrets. |
| Dependency supply chain | 🟡 Low | ~8 npm packages. Run `npm audit` before deploy. Pin versions. |
| XSS / injection | 🟢 None | No user input goes to a server. No `dangerouslySetInnerHTML` with dynamic content. |
| Data leakage | 🟢 None | No database, no API calls, no analytics (unless added). |
| Hosting platform | 🟢 None | Vercel is SOC 2 compliant. Static sites have no serverless injection surface. |

### Security Rules

```
✅ No API keys, tokens, or secrets in client code
✅ No real investor data embedded anywhere
✅ npm audit clean before every deploy
✅ HTTPS enforced (Vercel default)
✅ PIN documented as "demo mode" — not real auth
✅ No eval(), no innerHTML with dynamic data
⛔ Do NOT build real authentication for the MVP
```

---

## 🖥️ Compute Requirements

### Development

| Resource | Needed |
|----------|--------|
| RAM | 8 GB minimum (16 GB ideal) |
| Node.js | v18+ (v20 LTS recommended) |
| Disk | ~2 GB (node_modules + build cache) |
| Browser | Chrome + Safari for testing |

### Production (Vercel Free)

| Metric | Your Demo Load | Vercel Free Limit |
|--------|---------------|-------------------|
| Concurrent users | 50 | Thousands (edge-cached) |
| Bandwidth/mo | ~2–5 GB | 100 GB |
| Requests/mo | ~5,000–20,000 | 1,000,000 |
| Build time | ~30–60 sec | 6,000 min/mo |

> [!NOTE]
> At 50 concurrent users, you're using less than 5% of Vercel's free tier capacity. This will never be a bottleneck.

---

## ⚠️ Top Risks (Ranked)

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | **Mobile Safari animation jank** | Demo looks choppy on investor's iPhone | Test on real iPhone by end of Day 2. Use `transform` over `top/left`. Avoid stacking `backdrop-filter` + video + animations. |
| 2 | **Video autoplay blocked on iOS** | Lock screen looks dead — no motion | Always set `muted playsInline autoPlay`. Have a CSS gradient fallback. |
| 3 | **Scope creep** | Never ships | MVP = Lock screen + PIN + Home grid + Dynamic Island + 2 app pages. That's it. |
| 4 | **Touch gesture conflicts** | Swipe-up fights browser refresh/nav | Set `touch-action: none` on body. Use `overscroll-behavior: contain`. |
| 5 | **Web Audio blocked until interaction** | No tap sounds on first load | Resume `AudioContext` on first user tap. Pre-load all sounds. |

---

## 🏁 Decision Summary

| Question | Answer |
|----------|--------|
| **What repos?** | Next.js + react-live-island + devices.css + Konsta UI + Framer Motion + Zustand |
| **Starting point?** | `npx create-next-app` → lock screen first |
| **The goal?** | 10-second "wow" for investors, in-browser |
| **Hosting?** | Vercel Free (Hobby tier) |
| **Total cost?** | $0 |
| **Who builds it?** | Antigravity — no external hire needed |
| **Security risk?** | Minimal — no backend, no data, PIN is cosmetic |
| **Top worry?** | Mobile Safari performance — test early |
