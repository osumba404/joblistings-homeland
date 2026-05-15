# Homeland Jobs — Job Listings Page

**Candidate:** Evans Osumba | **ID:** HEH/DK1/009
**Assessment:** Day 3 — Frontend Practical Build
**Submitted:** May 2026

---

## Overview

A fully responsive Job Listings Page for the Homeland Ecosystem Hub platform, built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v3**. The page lets users browse, filter, sort, and apply for freelance jobs across East Africa.

---

## Setup Instructions

### Prerequisites

- **Node.js** 18.x or higher (`node -v` to check)
- **npm** 9+ (bundled with Node.js)

### 1. Clone / navigate to the project

```bash
cd joblistings-homeland
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Demo note:** `SIMULATE_INITIAL_ERROR = true` is set at the top of `app/page.tsx`.
> On first load you will see the error state. Click **Try Again** to load real data.
> Set the flag to `false` to skip the error demo.

### 4. Build for production

```bash
npm run build   # type-checks and compiles
npm start       # serves the production build
```

---

## Features

| Feature | Detail |
|---|---|
| **Sticky header** | `position: sticky` via Tailwind `sticky top-0`; collapses to hamburger on mobile |
| **Logo + nav** | Home, Jobs, Post a Job, Sign In; active page marked with `aria-current="page"` |
| **Search bar** | Real-time filtering by job title, employer name, or skill tag |
| **Category filter** | Dropdown; options derived dynamically from mock data |
| **Location filter** | Dropdown; options derived dynamically from mock data |
| **Budget range filter** | 5 pre-set KES ranges (Under 10K → Over 60K) |
| **Sort By dropdown** | Newest First, Budget High→Low, Budget Low→High, Most Proposals; sorts the filtered set only |
| **Showing X of Y** | Updates instantly as filters/sort change; shows "(filtered)" when active |
| **15 job cards** | Local JSON mock data (`data/jobs.json`); each card shows title, employer, budget, location, skills, posted date, proposal count, Apply button |
| **Responsive grid** | 3-col desktop (≥1024px), 2-col tablet (≥640px), 1-col mobile |
| **Skeleton loading** | 6 shimmer skeleton cards shown for 1.5s on initial load — no blank screen |
| **Empty state** | Illustrated section with "Clear All Filters" button when no results match |
| **Error state** | User-friendly error banner with technical detail and **Try Again** button; simulates 503 on first load |
| **Job detail modal** | Opens on card click; shows full description, employer info + star rating, budget, deadline, skills |
| **Proposal form** | Cover letter (min 100 chars), proposed budget (KES), timeline (days), optional portfolio URL |
| **Inline form validation** | Errors shown per-field after blur or on submit; no browser `alert()` or native tooltips |
| **Confirmation state** | Replaces form after a mocked 1.2s submission delay; shows next-steps checklist |
| **Modal accessibility** | Focus trap (WCAG 2.1 SC 2.1.2), Escape to close, click-outside to close, `aria-modal`, focus restored on close |
| **Keyboard navigation** | Logical tab order throughout; all interactive elements are focusable and have visible focus rings |
| **Semantic HTML5** | `article`, `header`, `section`, `nav`, `address`, `time`, `dl`/`dt`/`dd`, `ul`/`li`, `footer`, `main` used throughout |

---

## Project Structure

```
joblistings-homeland/
├── app/
│   ├── globals.css          # Tailwind base + shimmer keyframe animation
│   ├── layout.tsx           # Root layout with page metadata
│   └── page.tsx             # Main jobs page — filter, sort, error, and modal state
├── components/
│   ├── Header.tsx           # Sticky header with desktop nav + mobile hamburger menu
│   ├── JobCard.tsx          # Individual job listing card (article element)
│   ├── JobCardSkeleton.tsx  # Shimmer placeholder card (aria-hidden)
│   ├── JobModal.tsx         # Job detail modal with proposal form
│   └── EmptyState.tsx       # No-results UI with reset button
├── data/
│   └── jobs.json            # 15 mock job listings with KES budgets and KE employers
├── types/
│   └── job.ts               # TypeScript Job interface
├── README.md
└── package.json
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.x | React framework, App Router, file-based routing |
| TypeScript | 5.x | Static typing throughout |
| Tailwind CSS | 3.4 | Utility-first styling — zero inline `style` attributes |
| React | 19.x | UI library |

No external component libraries, icon packs, or state management libraries were used.

---

## Design Decisions

- **No external state library** — `useState` and `useMemo` are sufficient for client-side filtering of a small, static dataset. Adding Zustand or Redux would be premature optimisation.
- **Filter + sort in one `useMemo`** — combining them guarantees sort always operates on the filtered subset; two separate memos could silently sort the full list if dependencies drifted.
- **`loadAttempt` counter for retry** — incrementing an integer is cleaner than toggling/resetting a boolean; the `useEffect` re-fires naturally on each increment.
- **Shimmer via pure CSS** — a single `@keyframes shimmer` rule in `globals.css`; no skeleton library needed.
- **`cancelled` flag in async effects** — guards against stale setState calls after unmount or React StrictMode double-invoke.
- **`noValidate` on proposal form** — browser-native validation tooltips are visually inconsistent across platforms; we show our own inline errors as the single source of truth.

---

## Semantic HTML5 — Element Usage

| Element | Where used | Why |
|---|---|---|
| `<header>` | Site header, modal dialog header | Landmark for page/section header |
| `<nav>` + `<ul>`/`<li>` | Desktop and mobile navigation | Proper list semantics for navigation links |
| `<main>` | Job grid area | Primary page content landmark |
| `<footer>` | Site footer | Landmark for page footer |
| `<article>` | Each job card, skeleton card | Self-contained distributable content |
| `<section>` | Hero, filters, job detail panels, empty state, error state | Named content regions |
| `<address>` | Employer name in card and modal | Contact/authorship info for the article |
| `<time dateTime>` | Posted date on cards; deadline in modal | Machine-readable date for browsers and screen readers |
| `<dl>` / `<dt>` / `<dd>` | Budget, deadline, location in modal | Semantic key-value metadata pairs |

---

## AI Tools Used

> *AI tools are permitted from Day 3 onwards. Usage is declared here per assessment instructions.*

**Claude Code — Anthropic claude-sonnet-4-6** was used to:
- Scaffold all project files (package.json, tsconfig, Tailwind and PostCSS config, Next.js config)
- Generate the 15-entry `jobs.json` mock dataset with realistic Kenyan employer names, KES budgets, and relevant East African skills
- Write all component and page code including the modal, form validation, error state, retry logic, and sorting
- Apply semantic HTML5 refactoring across all components
- Add accessibility attributes (`aria-*`, `role`, `aria-live`, focus management)
- Write meaningful WHY comments throughout the codebase
- Author this README

All generated code was reviewed by the candidate and the architectural decisions reflect deliberate choices aligned with the assessment requirements.

---

## Known Limitations

| Limitation | Reason / Workaround |
|---|---|
| No real API — mock data only | Assessment scope; replace `import("@/data/jobs.json")` with a `fetch()` call in `page.tsx` |
| Proposal form does not persist | No backend; a real implementation would POST to `/api/proposals` |
| `SIMULATE_INITIAL_ERROR = true` is on by default | Set to `false` in `app/page.tsx` line 14 to skip the error demo on first load |
| No image assets — SVG icons only | No `<img>` tags exist in the codebase; all icons are inline SVG (`aria-hidden="true"`) |
| No authentication | Sign In and Post a Job nav links are placeholder `href="/"` routes |
| No pagination | All 15 mock jobs are rendered at once; a real implementation would paginate server-side |
| Sorting resets on filter clear | `resetFilters()` sets `sortBy` back to "newest"; this is intentional UX |

---

*Homeland Ecosystem Hub · Technology · Business · Innovation · www.homelandhub.org*
