# Homeland Jobs — Job Listings Page

---

## Overview

A fully responsive Job Listings Page built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features real-time filtering, skeleton loading states, and a mobile-first responsive grid layout aligned with the Homeland Ecosystem Hub brand.

---

## Features

| Feature | Implementation |
|---|---|
| Sticky header | `position: sticky`, z-50 via Tailwind |
| Logo + nav links | Home, Jobs, Post a Job, Sign In |
| Search bar | Filters by title, employer, and skills in real-time |
| Category filter | Derived dynamically from mock data |
| Location filter | Derived dynamically from mock data |
| Budget range filter | 5 pre-set KES ranges |
| Showing X of Y count | Updates instantly as filters change |
| 15 job cards | Local JSON mock data (`data/jobs.json`) |
| Responsive grid | 3-col (≥1024px), 2-col (≥640px), 1-col (mobile) |
| Loading skeleton | 6 skeleton cards shown for 1.5s on initial load |
| Empty state UI | Illustrated message + "Clear All Filters" button |
| Mobile menu | Hamburger toggle for mobile navigation |

---

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Data:** Local JSON mock (`data/jobs.json`) 
- **State:** React `useState` + `useMemo` 
---

## Setup Instructions

### Prerequisites

- Node.js **18.x** or higher
- npm or yarn

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

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
joblistings-homeland/
├── app/
│   ├── globals.css        # Tailwind base + shimmer animation
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main jobs page (all filter logic lives here)
├── components/
│   ├── Header.tsx         # Sticky header with mobile nav
│   ├── JobCard.tsx        # Individual job card
│   ├── JobCardSkeleton.tsx# Shimmer skeleton placeholder
│   └── EmptyState.tsx     # No-results UI
├── data/
│   └── jobs.json          # 15 mock job listings
├── types/
│   └── job.ts             # TypeScript Job interface
├── README.md
└── package.json
```

---

## Design Decisions

- **No external state library** - `useState` and `useMemo` are sufficient for client-side filtering of a small dataset. Adding Redux/Zustand would be premature.
- **`useMemo` for filtering** - prevents re-computing filtered results on unrelated re-renders.
- **Shimmer CSS animation** - pure CSS `@keyframes` shimmer, no external skeleton library needed.
- **Derived filter options** - category and location options are built from the actual data, so adding new jobs automatically updates the filters.
- **`useMemo` for filter lists** - computed once per data load, not on every keystroke.

---

## AI Tools Used


**Claude Code (Anthropic claude-sonnet-4-6)**
- Scaffold all project files
- Generate the 15-entry `jobs.json` mock dataset
- Design the filter logic using `useMemo` for performance
- Structure the README

All code was reviewed

---

## Responsive Breakpoints

| Breakpoint | Columns | Tailwind class |
|---|---|---|
| Mobile (< 640px) | 1 column | `grid-cols-1` |
| Tablet (≥ 640px) | 2 columns | `sm:grid-cols-2` |
| Desktop (≥ 1024px) | 3 columns | `lg:grid-cols-3` |

---

