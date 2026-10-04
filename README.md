# NxtWave AI Workshop Growth Engine

> **Turn one student into a growth loop.**
> A working growth-product asset for the **NxtWave Growth Intern – Growth Challenge**: acquire final-year engineering students for the free online workshop *"Build Your First AI Project in 60 Minutes"* — 7-day campaign, 500-registration target, ₹2,000 budget (simulation only; no real outreach).

---

## ❓ Problem

How can we generate **500 registrations** from final-year engineering students in **7 days** with a **₹2,000 budget**?

A conventional landing page only *captures* registrations. At this budget, paid acquisition cannot be the primary engine — the growth has to come from the students themselves.

## 💡 Solution

A **referral-driven growth engine** connecting:

```
Registration → Referral → Attribution → Analytics → Optimization
```

Every student who registers gets a unique referral code and a shareable link. Each friend who registers through it is attributed back to them — feeding live dashboards, an AI Growth Analyst and a Campaign Simulator. The landing page is just the top of the loop; the loop itself is the product.

## ✨ Features

- Workshop landing page (campaign story, benefits, who-it's-for, how-it-works)
- Student registration with server-side validation
- Unique referral-code generation + referral URL attribution (`?ref=CODE`)
- WhatsApp sharing + copy link/code
- Student Growth Profile (personal funnel, timeline, college contribution, rank)
- Admin Growth Command Center (9 sections: overview, registrations, referrals, channels, colleges, leaderboard, 7-day campaign, AI insights, simulator)
- Channel & college analytics + ₹2,000 budget tracker
- Referral leaderboard
- AI Growth Analyst — deterministic rule engine, no external API
- Campaign Simulator (channel sliders → projected registrations, cost/registration, target gap)
- Evaluator Demo Mode (pre-seeded data, one-click Reset Demo)

## ✅ Current Status (Snapshot: 2026-10-04)

**Complete, verified, and ready for evaluation.** All core growth-loop capabilities are implemented and browser-tested E2E:

| Area | Status |
|---|---|
| Landing page (dark, showcase-matched) | ✅ Done |
| Registration + referral attribution (`?ref=CODE`) | ✅ Done |
| Referral code generation + WhatsApp share + copy link | ✅ Done |
| Success screen (confetti, code card, share actions) | ✅ Done |
| Student Growth Profile (`/#/growth?code=`) | ✅ Done |
| Admin Command Center — 9 sections | ✅ Done |
| AI Insights (deterministic rule engine) | ✅ Done |
| Campaign Simulator (channel sliders → projections) | ✅ Done |
| Demo mode (DEMO MODE badge, Load/Reset Demo) | ✅ Done |
| Mobile responsive (390px verified) | ✅ Done |
| Lint clean, zero console errors | ✅ Verified |

---

## 🧭 Evaluator Flow (< 3 minutes)

1. **Landing** (`/`) — understand the campaign in 10 seconds → **Register Free**
2. **Register** (`/#/register`) — fill form (optionally arrive via `?ref=CODE`, pre-filled + attributed)
3. **Success** — get unique code (e.g. `JASWAN577`), **Copy Referral Link / Share on WhatsApp**
4. **My Growth** (`/#/growth?code=…`) — personal funnel: Shared → Clicked → Registered, timeline, rank
5. **Dashboard** (`/#/admin`) — KPIs, target progress, daily trend, channels + budget, colleges, leaderboard, funnel, AI Insights, 7-day plan
6. **Simulator** — move channel sliders → projected registrations / cost / target gap change instantly

---

## 🛠 Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4** + **shadcn/ui**
- **Prisma + SQLite** (`db/custom.db`) — swappable service layer for a real DB later
- **Recharts** (analytics), **framer-motion** (motion), **sonner** (toasts), **zod** (validation)
- SPA shell: single route (`/`) with hash routing (`/#/register?ref=`, `/#/success`, `/#/growth?code=`, `/#/admin/*`) + `useSyncExternalStore` mount guard (no SSR hydration mismatch)

## 📁 Key Structure

```
src/
  app/page.tsx              # SPA shell + hash router
  app/api/                  # register · campaign · insights · students · student · demo/reset
  components/growth-engine/
    landing/landing-view.tsx        # hero + laptop mockup + story sections
    register/register-view.tsx      # form + ref capture/attribution
    register/success-view.tsx       # confetti + referral code + share
    growth/growth-view.tsx          # student growth profile
    admin/admin-view.tsx            # command center shell (navy sidebar)
    admin/sections/                 # overview · registrations · referrals · channels
                                    # colleges · leaderboard · campaign · insights · simulator
    admin/charts.tsx                # DailyChart · CampaignDonut · FunnelBars …
    shared/                         # site-chrome (nav/footer) · primitives · not-found
  lib/                      # types · db (prisma) · api client · simulator · campaign-config · format
prisma/
  schema.prisma             # Student (self-referral relation) · Referral · Campaign · CampaignEvent
  seed.ts                   # deterministic demo dataset generator
db/custom.db                # seeded SQLite database (pristine demo state)
```

## ▶️ How to Run

The repository ships with the **pre-seeded demo database** (`db/custom.db`) — no seed step needed for evaluation:

```bash
npm install            # or bun install
npm run dev            # http://localhost:3000
```

Optional (regenerate the demo dataset from scratch):

```bash
npm run db:push        # recreate SQLite schema
npm run db:generate    # generate Prisma client
npm run db:seed        # deterministic seed (idempotent)
```

- **Reset demo anytime:** Admin sidebar → *Reset Demo*, or `POST /api/demo/reset` (restores pristine 327-registration state).
- **Production build:** `npm run build && npm start` (standalone output; verified — see Deployment).

## 📊 Pristine Demo Dataset (internally consistent)

- **327 / 500 registrations (65.4%)** across Days 1–5 → daily `[38, 52, 61, 82, 94]`
- **182 referral registrations (55.7%)** attributed to exactly **71 referrers**
- **24 colleges** (exact quotas), 9 branches, 7 channels
- Funnel telemetry: **4,967 reach → 1,527 visits → 464 starts → 208 shares → 540 referral clicks → 327 registrations (21.4% conversion)**
- Budget: **₹980 spent / ₹2,000** · ₹27.2 paid CPA · ₹3.00 blended cost per registration
- All aggregates computed from the DB (channel totals, funnel and daily sums are mathematically consistent)

## 🧠 Design Decisions Worth Knowing

- **One coherent growth loop**, not disconnected pages: every view reads/writes the same Prisma models; referrals attribute end-to-end (capture → pre-fill → attribute → dashboard → insights).
- **Deterministic AI insights** (rule-based, no external API): referral-club volume, referral share, pacing vs. target, paid-channel CPC evaluation + Double Down / Test / Watch recommendations.
- **Transparent simulator**: labeled *"Simulation — not actual campaign results"*; deterministic math from channel reallocation.
- **Honest demo labeling** everywhere: DEMO MODE badges, "Demo Campaign Data", no real personal data (seeded names/emails are fictional).
- **Server-side guards**: zod validation, sanitization, duplicate-email 409, self-referral block, unique name-based code generation.
- **UI system** (matched to approved showcase): light dashboard theme (white cards, navy sidebars) + scoped `.theme-dark` for landing/success; aurora backdrop, CSS confetti, gradient CTAs, count-up KPIs, theme-aware charts.

## 🔒 Scope Notes

Simulation-only by challenge rules — no real emails/WhatsApp messages are sent; sharing links are real `wa.me`/copy actions that the evaluator can try. No hardcoded API keys; no data leaves the local database.

**All campaign metrics shown in Demo Mode are simulated/illustrative** — they are not actual campaign results, and every dashboard carries a DEMO MODE label.

---

## 🚀 Deployment

### Environment variables

**None are required.** The app uses the bundled SQLite snapshot at runtime and has zero external API dependencies (AI insights are deterministic by design). A `.env` file is only needed for local DB-regeneration workflows (`DATABASE_URL=file:../db/custom.db`) and is **not** committed — `.gitignore` excludes `.env*`, `node_modules/`, `.next/`, `.vercel/`.

### Deploy to Vercel (recommended)

1. **Push to GitHub** (see below), then open [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository** → select the repo.
2. Framework is auto-detected as **Next.js** — leave build settings at their defaults. Leave **Environment Variables empty** (nothing is needed).
3. **Deploy** → wait for ✓ Build / ✓ Ready → open `https://<your-repo>.vercel.app`.
4. **Verify in an incognito window** (production smoke test):
   - Landing loads → click **Reserve My Free Seat** → register a test student → referral code appears.
   - Open the referral link in a new incognito tab → register a second student → check the first student's growth profile (+1 referral).
   - Open `/admin` → all 9 sections render → move a Simulator slider → projections change.
   - Visit `/random-page` → branded 404. Check mobile viewport.

### Demo data on Vercel

Vercel's serverless filesystem is read-only, so the app materializes a writable copy of the pristine seeded SQLite database in `/tmp` on cold start (`src/lib/db.ts`). Practical consequences:

- The demo **always starts from the pristine 327/500 snapshot** — evaluator registrations persist within a session and self-reset on cold starts. No external database service is needed.
- Writes never touch the deployment bundle; nothing breaks mid-evaluation.

### Local production build (VPS / self-host)

```bash
npm run build          # next build + standalone asset copy (skipped on Vercel)
npm start              # node .next/standalone/server.js  (PORT env supported)
```

### Push to GitHub

Repository: [`satyaborra/nxtwave_growthIntern`](https://github.com/satyaborra/nxtwave_growthIntern)

```bash
git status                                 # clean tree, no .env / node_modules / .next
git remote add origin https://github.com/satyaborra/nxtwave_growthIntern.git
git push -u origin main --force            # --force replaces the initial README-only commit
```

After the push, the repo contains the full application: `src/` (App Router pages, components, API routes), `prisma/` (schema + deterministic seed), `db/custom.db` (pristine demo database), configs, and this README. The project uses **Bun** (`bun.lock`); there is no `package-lock.json` — Vercel auto-detects Bun with zero configuration.
