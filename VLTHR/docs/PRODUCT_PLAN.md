# VLTHR Terminal — Product Expansion Plan
**Status: AWAITING REVIEW & GO-AHEAD**
**Author: Engineering**
**Date: 2026-05-14**

---

## Executive Summary

This document covers three interconnected expansions:
1. **Data Infrastructure** — Parquet-first serving model to eliminate rate limits
2. **App Expansion** — 8 → 15 apps (7 new apps across Markets, Tools, Support)
3. **Desktop UI Enrichment** — Overview cards + live news headline carousel

> **⚠️ Data infrastructure (Phase 1) must be completed before any new apps are built.**
> All new apps depend on the parquet data layer to function correctly and sustainably.

---

## Scalability Assessment — 100 Concurrent Users

### Current Architecture (Live API model)
- 100 users × 8 apps × avg 3 API calls per open = **2,400 external API calls per session**
- MarketAux limit: 100/day → **exhausted by 1 user in 1 session**
- Twelve Data limit: 800/day → **exhausted by ~4 users**
- **Verdict: Breaks at 2–5 concurrent users. Not viable.**

### Target Architecture (Parquet-first model)
- 100 users reading from parquet = **0 additional external API calls**
- All external API calls happen only during scheduled harvests (1× per category per day)
- Backend serves parquet file reads: **< 5ms per read**, Node.js handles 1,000+ req/sec
- Redis caches hot responses for < 1ms repeat reads
- Docker containers: frontend (Next.js) + backend (Express) both horizontally scalable

**Verdict: With parquet-first model, 100 concurrent users = NO PROBLEM.**
Backend compute load per user becomes a file read + JSON serialization (~1ms).
Upgrade path: add a second backend container behind a load balancer if needed (no code changes).

### Daily API Quota — Revised (Focused Strategy)
| Provider | Old Usage | New Usage | Saved |
|---|---|---|---|
| Twelve Data (800/day) | ~400–800 burst | 25 (daily delta update) | 97% |
| **MarketAux (100/day)** | **1 per page open** | **50 (controlled harvest)** | **50% used, 50% buffer** |
| NewsAPI (100/day) | 1 per page open | Fallback only | >95% saved |
| Alpha Vantage (25/day) | 1 per fundamentals view | 10 (daily harvest) | stable budget |
| CoinGecko (10,000/day) | Live per open | 1/hour snapshot | no concern |
| World Bank (24,000/day) | Live per open | 1/month per indicator | no concern |

---

## Section 1 — Data Infrastructure (Phase 1 — MUST DO FIRST)

### 1.1 Parquet Data Lake Layout
```
/data/
├── forex/
│   └── <SYMBOL>/          e.g. USD_EUR/
│       └── <timeframe>/   1min/ 1day/ etc.
│           └── history.parquet
│
├── crypto/
│   └── <SYMBOL>/          e.g. BTC_USD/
│       └── <timeframe>/
│           └── history.parquet
│
├── equities/
│   └── <SYMBOL>/          e.g. AAPL/
│       └── <timeframe>/
│           └── history.parquet
│
├── news/                               ← NEW STRUCTURE (v2)
│   └── <category>/        finance/ stocks/ crypto/ tech/ economy/
│       ├── YYYY-MM.parquet             ← Monthly partition
│       └── index.json                  ← Fast metadata (count, sentiment, sources)
│
├── macro/
│   └── <country>/         USA/ CHN/ EUU/
│       └── <indicator>.parquet
│
└── snapshots/
    └── <category>/        crypto/ equities/ forex/
        └── <YYYY_MM_DD_HH>.parquet
```

---

## Section 1A — News Data Strategy (Revised — v2)

### Rationale
The original 1-year plan at 95 req/day would exhaust the MarketAux free-tier quota daily and return many irrelevant articles. The revised strategy:
- Prioritises **relevance over volume** via tightly scoped keyword profiles per category
- Uses **50 of 100 daily requests** (safe buffer), 10 per category
- **Newest-first harvesting** — Day 1 always gets the most actionable recent data
- **6-month default range** achievable in 2–3 daily runs vs 4–5 previously
- **English only** — avoids non-English noise polluting the feed
- `must_have_entities=true` on ticker-tagged categories (finance, stocks, crypto, tech) — ensures every article references a real tracked financial instrument

### Category Profiles
| Category | Focus | Entity Filter | Keyword Scope |
|---|---|---|---|
| **finance** | Portfolio, bonds, wealth mgmt | `equity,index` | investment, hedge fund, asset allocation, dividend, bond yield |
| **stocks** | Earnings, analyst ratings, IPOs | `equity` | earnings, revenue, S&P 500, NASDAQ, guidance, buyback |
| **crypto** | BTC/ETH/SOL, DeFi, institutional | `cryptocurrency` | bitcoin, ethereum, solana, DeFi, staking, altcoin |
| **tech** | AI, semis, FAANG, cloud | `equity` | AI, semiconductor, NVIDIA, Apple, Microsoft, cloud, SaaS |
| **economy** | Fed, CPI, GDP, employment | *(none — broad macro)* | federal reserve, inflation, GDP, CPI, monetary policy, tariff |

### Daily Harvest Math
```
50 requests/day ÷ 5 categories = 10 requests per category
10 requests × 50 articles/request = 500 articles per category per day
500 articles × 5 categories = 2,500 targeted, English, financial articles per day
```

### 6-Month Backfill Schedule
| Run | Coverage |
|---|---|
| Day 1 | Most recent 10 weeks (newest first) across all 5 categories |
| Day 2 | Next 10 weeks back across all 5 categories |
| Day 3 | Final 6 weeks (completes 6-month window) |

> After initial backfill, run once/day to refresh the current month only (~5 requests total).

### QAQC + Sentiment Pipeline
Every article passes through `newsParquet.js` before writing:
1. **QAQC gate** — rejects if: title < 10 chars, URL missing, no date, 2+ issues
2. **Quality score** — 0.0–1.0 based on: has summary (>50 chars), has image, has tickers, title > 40 chars
3. **MD5 dedup** — URL-hashed ID prevents duplicates across runs
4. **Sentiment scoring** — lexicon-based: +1 (positive) / -1 (negative) words ratio → label + numeric score
5. **Monthly merge** — new articles are merged into `YYYY-MM.parquet` then index.json is updated

### Harvest Commands
```bash
node Backend/harvestNews.js                          # full 6-month, all 5 categories
node Backend/harvestNews.js --category crypto        # single category
node Backend/harvestNews.js --from 2024-11-01        # custom start
```


### 1.2 New Parquet Modules Required

#### `lib/newsParquet.js`
Schema per article:
```
id           UTF8
title        UTF8
summary      UTF8
url          UTF8
source       UTF8
published_at INT64   (unix ms)
category     UTF8    forex | crypto | equities | general
tickers      UTF8    JSON array e.g. '["BTC","ETH"]'
sentiment    UTF8    positive | negative | neutral
image_url    UTF8
```
Partitioned by: `data/news/<category>/<YYYY_MM_DD>.parquet`
Refresh: once per day per category (4 MarketAux calls/day total)

#### `lib/macroParquet.js`
Schema per data point:
```
timestamp  INT64
country    UTF8
indicator  UTF8
value      DOUBLE
label      UTF8    (human-readable indicator name)
```
Partitioned by: `data/macro/<country>/<indicator>.parquet`
Refresh: once per month (World Bank data is annual/quarterly)

#### `lib/snapshotParquet.js`
Schema per asset snapshot:
```
symbol      UTF8
price       DOUBLE
change_1d   DOUBLE
change_pct  DOUBLE
market_cap  DOUBLE
volume      DOUBLE
category    UTF8
fetched_at  INT64
```
Partitioned by: `data/snapshots/<category>/<YYYY_MM_DD_HH>.parquet`
Refresh: hourly (CoinGecko for crypto, Twelve Data for equities quotes)

### 1.3 Parquet-First Route Pattern
Every backend route follows this contract:
```
1. Read parquet → if fresh (within TTL), return immediately
2. If stale or missing → hit external API
3. Write result to parquet
4. Return data
```
TTL per category:
- Crypto prices: 1 hour
- Equities quotes: 1 hour (market hours only)
- Forex rates: 4 hours
- News articles: 6 hours
- Macro indicators: 30 days
- OHLCV history: permanent (immutable historical bars)

### 1.4 Route Fixes Required
| Route | Current Problem | Fix |
|---|---|---|
| `GET /api/news?category=` | Live API every call, no category filter | Read `news/<category>/today.parquet` first |
| `GET /api/macro/indicator` | Live World Bank every call | Read `macro/<country>/<indicator>.parquet` first |
| `GET /api/forex/history` | Live Twelve Data every call | Read parquet OHLCV, serve immediately |
| `GET /api/forex/latest` | Live Frankfurter every call | Read from forex snapshot parquet |
| `GET /api/equities/history` | Live Twelve Data every call | Read parquet OHLCV |
| `GET /api/equities/fundamentals` | Live Alpha Vantage every call | Read snapshot parquet (refresh 24h) |
| `GET /api/crypto/top` | Live CoinGecko every call | Read hourly snapshot parquet |

### 1.5 harvest.js Additions
Add to existing harvest.js:
```
Phase 5: NEWS (4 MarketAux calls/day)
  → equities news (tickers: AAPL, MSFT, NVDA, TSLA...)
  → crypto news (tickers: BTC, ETH, SOL, XRP...)
  → forex news (keywords: forex, currencies, dollar, euro...)
  → general finance news (keywords: markets, economy, finance...)

Phase 6: SNAPSHOTS
  → CoinGecko top 50 coins snapshot
  → Equities quote snapshot for watchlist symbols
```

---

## Section 2 — App Expansion: 8 → 15 Apps

### Current 8 Apps
1. Crypto Markets
2. Forex Board
3. Equities Panel
4. News Feed
5. Macro Dashboard
6. Signal Engine
7. Portfolio
8. Settings

### 7 New Apps

#### Markets Category (2 new)

**App 9 — Economic Calendar**
- Purpose: Upcoming and past economic events — earnings, FOMC meetings, CPI releases, NFP, GDP prints
- Data source: Alpha Vantage earnings calendar + World Bank schedule + curated static dataset
- Key screens: Monthly calendar view, event detail, impact rating (low/medium/high), countdown to next event
- Parquet: `data/calendar/<YYYY_MM>.parquet`

**App 10 — Options Desk**
- Purpose: Options chain viewer, Greeks display (Delta, Gamma, Theta, Vega), implied volatility surface
- Data source: Alpha Vantage options endpoint or FMP options data
- Key screens: Symbol search, expiry selector, call/put chain table, IV surface heatmap
- Parquet: `data/options/<SYMBOL>/<YYYY_MM_DD>.parquet`

#### Tools Category (3 new)

**App 11 — Watchlist**
- Purpose: Personal multi-asset watchlist spanning crypto, forex, equities in one view
- Data source: Served from snapshots parquet (real-time feel, zero API calls)
- Key screens: Watchlist table with price/change/sparkline, add/remove assets, sort by category
- State: Stored in Zustand + persisted to `db.json`

**App 12 — Screener**
- Purpose: Multi-asset screener with filter conditions (price > X, change% > Y, volume > Z, sector = tech)
- Data source: Snapshots parquet + fundamentals parquet
- Key screens: Filter builder, results table, click-through to equity/crypto page
- Parquet: Reads from existing `snapshots/` + `equities/<symbol>/` partitions

**App 13 — Risk Lab**
- Purpose: Portfolio risk analytics — Value at Risk (VaR), Sharpe ratio, correlation heatmap, drawdown chart, stress test scenarios
- Data source: Portfolio positions + OHLCV parquet (all calculations done server-side)
- Key screens: Risk summary cards, correlation matrix heatmap, historical drawdown chart, stress test table

#### Support/Business Category (2 new)

**App 14 — Concierge**
- Purpose: Support hub + onboarding assistant + business contact
- Sections:
  - Welcome / onboarding checklist
  - Live chat or contact form (Crisp/Tawk.to embed or static contact)
  - Help articles (static markdown, rendered in-app)
  - System status (backend health endpoint)
  - Request a feature form
- No API dependency — fully static with optional contact embed

**App 15 — Reports**
- Purpose: Auto-generated market reports + portfolio performance summaries
- Key screens:
  - Daily market brief (generated from parquet snapshots)
  - Portfolio performance report (P&L, allocation, best/worst performers)
  - Export options (PDF download, shareable link)
- Data source: Parquet snapshots + portfolio db.json

### App Grid Layout (15 apps × 3 rows)
```
Row 1: Crypto Markets | Forex Board    | Equities Panel | News Feed      | Macro Dashboard
Row 2: Signal Engine  | Portfolio      | Econ Calendar  | Options Desk   | Watchlist
Row 3: Screener       | Risk Lab       | Concierge      | Reports        | Settings
```

---

## Section 3 — Desktop UI Enrichment

### 3.1 Overview Cards Row
Positioned below the menu bar, above the app grid.
A horizontal row of quick-glance market status cards.

**Cards (always visible on desktop):**
1. **BTC/USD** — price, 24h change%, sparkline (7-day)
2. **ETH/USD** — price, 24h change%, sparkline
3. **S&P 500** — price or index level, 1d change%
4. **EUR/USD** — rate, 1d change%
5. **DXY** (Dollar Index) — rate, trend arrow
6. **Top Mover** — biggest % gainer today across all tracked assets

Card design: `glass-dark` container, white text, red/green accent for change%, mini sparkline using SVG path.
Data source: `snapshots/crypto/` + `snapshots/equities/` parquet (read on desktop mount, refresh every 60s via interval).

### 3.2 News Headline Carousel
Positioned below overview cards, above app grid.
A single card that cycles through the last 5 news headlines.

**Behaviour:**
- Shows 1 headline at a time
- Auto-advances every 8 seconds
- Manual left/right tap controls
- Click/tap on headline opens full article in new tab
- "NEWS" category pill (color-coded: blue=forex, orange=crypto, green=equities, gray=general)
- News source + time-ago label
- Swipe gesture support

**Data source:** `GET /api/news?category=general&limit=5`
→ Read from `news/general/<today>.parquet` — zero API calls, instant load.

### 3.3 Component Structure (Frontend)
```
<Desktop>
  <MenuBar />
  <OverviewCardsRow />       ← NEW: 6 market snapshot cards
  <NewsHeadlineCarousel />   ← NEW: 5 headlines, auto-slide
  <AppGrid />                ← EXPANDED: 15 apps, 3 rows
  <WindowManager />
  <Dock />
</Desktop>
```

---

## Implementation Phases

### Phase 1 — Data Infrastructure (PREREQUISITE)
**All subsequent phases depend on this.**

Tasks:
- [ ] Create `lib/newsParquet.js` (schema + write/read/list)
- [ ] Create `lib/macroParquet.js` (schema + write/read)
- [ ] Create `lib/snapshotParquet.js` (schema + write/read)
- [ ] Update `services/news.js` to use parquet-first pattern with category filtering
- [ ] Update `services/macro.js` to use parquet-first pattern
- [ ] Update `services/forex.js` to use parquet-first for history
- [ ] Update `services/equities.js` to read OHLCV from parquet first
- [ ] Update `services/coingecko.js` to serve from hourly snapshot parquet
- [ ] Add news harvest section to `harvest.js` (4 MarketAux calls)
- [ ] Add snapshot harvest section to `harvest.js` (1 CoinGecko call)
- [ ] Run initial harvest to populate data lake

**Acceptance criteria:** All routes return 200 with data. Zero `ERR_NAME_NOT_RESOLVED` errors. Zero live API calls during normal page navigation.

### Phase 2 — Desktop UI (Overview Cards + News Carousel)
Tasks:
- [ ] `features/desktop/OverviewCardsRow.tsx` — 6 snapshot cards
- [ ] `features/desktop/NewsHeadlineCarousel.tsx` — 5 headlines, auto-slide
- [ ] Update `features/desktop/Desktop.tsx` to include both components
- [ ] Add `/api/snapshots?category=crypto` and `/api/snapshots?category=equities` routes
- [ ] Add `?limit=5` support to `/api/news` route
- [ ] Wire frontend fetch calls for both components

**Acceptance criteria:** Cards load in < 100ms (parquet). Carousel cycles correctly. No layout overflow.

### Phase 3 — New Apps Scaffold (7 apps)
For each new app:
- [x] App 9: Economic Calendar — `features/apps/CalendarPage.tsx`
- [x] App 10: Options Desk — `features/apps/OptionsPage.tsx`
- [x] App 11: Watchlist — `features/apps/WatchlistPage.tsx`
- [x] App 12: Screener — `features/apps/ScreenerPage.tsx`
- [x] App 13: Risk Lab — `features/apps/RiskLabPage.tsx`
- [x] App 14: Concierge — `features/apps/ConciergePage.tsx`
- [x] App 15: Reports — `features/apps/ReportsPage.tsx`

### Phase 4 — Backend Routes for New Apps
- [x] `/api/calendar`
- [x] `/api/options`
- [x] `/api/screener`
- [x] `/api/concierge/ask`
- [x] `/api/reports`
- [ ] `GET /api/calendar?month=&year=` → calendar parquet
- [ ] `GET /api/options/chain?symbol=&expiry=` → options parquet
- [ ] `GET /api/watchlist/prices?symbols=` → snapshot parquet multi-symbol
- [ ] `GET /api/screener?category=&filters=` → snapshot parquet filtered
- [ ] `GET /api/risk/portfolio` → compute from portfolio + OHLCV parquet
- [ ] `GET /api/reports/daily` → compile from snapshot + news parquet

### Phase 5 — Polish & Scheduler Prep
- [ ] Add quota display to Settings app (shows harvested vs live API usage)
- [ ] Add last-harvested timestamp to each parquet read response
- [ ] Document `harvest.js` CLI flags for partial harvest (e.g. `--only=news`)
- [ ] Prepare scheduler-compatible `harvest.js` interface (export `runHarvest()` for cron import)
- [ ] Validate all 15 apps on 1440×900 (desktop) and 390×844 (mobile)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MarketAux returns < 50 articles per category | Medium | Low | NewsAPI as fallback; store whatever is returned |
| Alpha Vantage 25/day limit hits during options harvest | High | Medium | Cache options data for 24h; use FMP as primary |
| Parquet write fails on disk full | Low | High | Add disk space check before harvest; alert log |
| Twelve Data rate limit during synthesis step | Medium | Medium | QuotaManager already handles this with backoff |
| Frontend fetch still hitting `backend:4000` | Resolved | Was High | Fixed: `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` in docker-compose.yml, container recreated with `docker-compose up -d` |

---

## Open Questions (Need Decision Before Phase 3)

1. **Dock apps** — Which of the 15 apps should appear in the dock (max 8)? User to review.
2. **Options data source** — Alpha Vantage options endpoint requires premium. FMP free tier may cover basic chains. Confirm provider.
3. **Reports export** — PDF generation requires a library (`puppeteer` or `jsPDF`). Confirm if export feature is required for v1 or parked for later.
4. **Concierge chat** — Static help articles only, or live chat embed (Tawk.to is free)? Confirm.
5. **Overview cards position** — Between menu bar and apps, or floating over wallpaper? Confirm visual spec.

---

## Summary

| Item | Status |
|---|---|
| Fix `ERR_NAME_NOT_RESOLVED` (backend URL) | ✅ Done |
| Clock hydration fix | ✅ Done |
| Dock dark glass | ✅ Done |
| Parquet-first data plan | 📋 Awaiting go-ahead |
| 7 new apps plan | 📋 Awaiting go-ahead |
| Overview cards + news carousel | 📋 Awaiting go-ahead |
| 100 concurrent users | ✅ Viable with parquet model |

**Next step: Confirm go-ahead → begin Phase 1 (data infrastructure).**
