# INSTRUCTIONS.md — Global System Rules

> **⚠️ MANDATORY: Read this file completely before writing a single line of code.**
> **⚠️ MANDATORY: Re-read the relevant phase section before starting each new phase.**
> **⚠️ This file overrides any conflicting instruction from any other document.**

---

## Identity

**Project:** ORTHO'M8 OS
**What it is:** An interactive iPhone-style operating system running in a web browser
**What it is NOT:** A website, a dashboard, a SaaS app, or a real operating system
**Purpose:** Investor demo — make them say "wow" in 10 seconds
**Budget:** $0 — zero spend on anything
**PIN code:** `1234` — this is hardcoded theatre, not security
**Theme:** Dark mode only — there is no light mode
**Primary target device:** iPhone Safari in portrait mode

---

## File Reading Order (Do This First)

Before ANY phase, read these files in this exact order. Do not skip any.

| Order | File | What You Learn | Time to Read |
|-------|------|---------------|--------------|
| 1 | **`instructions.md`** (this file) | Rules, constraints, quality bar | 3 min |
| 2 | **`SKILL.md`** | How to think, decide, and recover from errors | 8 min |
| 3 | **`orthom8_engineer_handoff.md`** | Exact specs: state model, animations, files, breakpoints | 10 min |
| 4 | **`orthom8_implementation_checklist.md`** | What to build in what order, task checkboxes | 5 min |
| 5 | **`designer-handoff.md`** | Original product vision for intent/context | 5 min |

**If you are a new AI agent picking this up mid-project,** also read any existing source code files before making changes. Never overwrite working code you haven't read.

---

## The 12 Immutable Rules

These rules cannot be bent, debated, or "improved upon." They are law.

### Architecture Rules
1. **No backend.** No API routes, no database, no server actions, no `fetch()` to external services. This is a static/SSR frontend only.
2. **No authentication.** The PIN is `1234`, checked client-side in JavaScript. Do not import auth libraries.
3. **No extra dependencies.** The full dependency list is: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `framer-motion`, `zustand`, `konsta`, `react-live-island`. That's it. Do not `npm install` anything else without explicit user approval.
4. **One Zustand store.** All application state lives in a single `useAppStore` store. No React Context. No Redux. No prop drilling complex state.

### Design Rules
5. **Dark mode only.** Background is `#000000`. There is no toggle. There is no light mode.
6. **Springs only.** Every user-facing animation uses spring physics (`type: "spring"`). The only exception is the PIN error shake (keyframes). Never use `ease-in-out`, `ease`, or `linear` for interactive motion.
7. **Glass on every surface.** Every card, overlay, and panel must have `backdrop-filter: blur()` + semi-transparent background + 1px border. If a surface is opaque, it's wrong.
8. **System fonts only.** Use `-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif`. Do not import Google Fonts.

### Priority Rules
9. **Lock screen is sacred.** If time runs short, cut app pages, cut notification center, cut Dynamic Island — never cut lock screen quality. It is the first and most important impression.
10. **Feel over features.** Three polished screens beat ten half-finished screens. If you must choose between "add a new page" and "make the existing transition smoother," always choose smoother.
11. **Mobile Safari first.** Test assumptions against Safari behavior. Chrome is more forgiving and will hide bugs that break on the investor's iPhone.
12. **Ship, don't plan.** If you catch yourself writing documentation, creating abstractions, or refactoring code that already works — stop. Build the next visible feature instead.

---

## Pre-Phase Checklist

**Run through this checklist at the start of EVERY phase.** Do not skip it.

```
Before Phase N:

□ I have re-read instructions.md (this file)
□ I have read the Phase N section in orthom8_implementation_checklist.md
□ I know exactly which files I'm creating or modifying
□ I know the acceptance criteria for this phase (the "Done When" line)
□ I have not introduced any new npm dependencies
□ My current code runs without errors (npm run dev works)
□ I am building for the demo, not for production robustness
```

---

## Phase Entry Gates

You may NOT start a phase until the previous phase passes its gate:

| Phase | Entry Gate (Must Be True Before Starting) |
|-------|------------------------------------------|
| **Phase 1: Scaffold** | You have read all 5 project files listed above |
| **Phase 2: Lock Screen** | `npm run dev` shows a dark screen with no errors. Zustand store is functional. |
| **Phase 3: Home + Island** | Lock screen renders. Swipe up works. PIN pad works. Unlock transition plays. |
| **Phase 4: Notifications + Pages** | Home screen shows app icons. Tapping an icon opens a placeholder. Dynamic Island renders. |
| **Phase 5: Polish** | All 4 app pages render content. Notification center opens and navigates. Back navigation works. |
| **Phase 6: Deploy** | Every interaction has spring animation. Glass effects render. Tap sounds play. No visual jank on Chrome. |

**If a gate is not passed, do not proceed.** Fix the current phase first.

---

## Quality Bar

A feature is "done" only when ALL of these are true:

- [ ] **It looks like iOS, not like a website.** Hold your output up to a screenshot of a real iPhone — does it pass the squint test?
- [ ] **Every tap has visual feedback.** Scale down to 0.92 on press, spring back to 1.0 on release. No dead buttons.
- [ ] **Every transition uses spring physics.** No instant cuts. No linear slides. Springs with overshoot.
- [ ] **Glass surfaces have all three layers:** `backdrop-filter: blur()` + `rgba()` background + `1px solid rgba()` border.
- [ ] **No console errors.** Zero warnings about missing keys, hydration mismatches, or deprecated APIs.
- [ ] **It works on a 390×844 viewport** (iPhone 14 dimensions). Content doesn't overflow, nothing is cut off.

---

## When You're Stuck

Follow this escalation path in order:

1. **Check SKILL.md → "Error Recovery Patterns"** — the 5 most common issues are already solved there.
2. **Check orthom8_engineer_handoff.md → "Pre-Solved Breakpoints"** — the 8 most common implementation failures have fixes written out with code.
3. **Simplify the feature.** Can you achieve 80% of the effect with half the code? Do that.
4. **Skip the feature.** If it's not the lock screen and it's blocking progress, comment it out and move to the next task. Come back to it in Phase 5 (Polish).
5. **Never spend more than 30 minutes on a single problem.** If you hit 30 minutes, apply step 3 or 4.

---

## What "Done" Looks Like

The project is complete when a non-technical person can do this unassisted:

```
1. Open the URL on their iPhone
2. See a realistic lock screen (video + clock + blur)
3. Swipe up (it resists with spring physics)
4. Enter 1-2-3-4 on the PIN pad (hear taps)
5. Watch the home screen appear (smooth transition)
6. See the Dynamic Island at the top
7. Tap an app icon (it opens with scale animation)
8. Read content on the app page
9. Navigate back to home
10. Pull down the notification center
11. Tap a notification card to open another page
12. Put the phone down and say "that was cool"
```

If step 2 doesn't work — nothing else matters.
If steps 3–5 feel janky — the demo fails.
If steps 6–12 are missing — the demo is still impressive (but incomplete).

**The lock screen and unlock flow carry 70% of the demo's impact.** Allocate your effort accordingly.

---

## Final Warning

This project has been over-documented on purpose. The specs are complete. The breakpoints are pre-solved. The animation values are exact. The content copy is written. The state model is defined.

**There is nothing left to figure out. Only to build.**

Do not re-architect. Do not "improve" the spec. Do not add features that aren't in the checklist. Build exactly what the documents describe, in exactly the order they specify, to exactly the quality bar defined above.

When all 48 checklist tasks are checked, the project is done.

---

**Now go read SKILL.md. Then open the handoff. Then build Phase 1.**
