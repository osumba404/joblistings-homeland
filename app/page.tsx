"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import EmptyState from "@/components/EmptyState";
import JobModal from "@/components/JobModal";
import type { Job } from "@/types/job";

// ─── Constants ────────────────────────────────────────────────────────────────

// Set to `true` to demo the error state on first load (Retry will succeed).
const SIMULATE_INITIAL_ERROR = true;

const BUDGET_RANGES = [
  { label: "All Budgets", min: 0, max: Infinity },
  { label: "Under KES 10,000", min: 0, max: 9999 },
  { label: "KES 10,000 – 30,000", min: 10000, max: 30000 },
  { label: "KES 30,000 – 60,000", min: 30000, max: 60000 },
  { label: "Over KES 60,000", min: 60001, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Budget: High → Low", value: "budget-desc" },
  { label: "Budget: Low → High", value: "budget-asc" },
  { label: "Most Proposals", value: "proposals-desc" },
];

// ─── Error Banner ─────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}

function ErrorBanner({ message, onRetry, retrying }: ErrorBannerProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Jobs</h2>
      <p className="text-gray-500 max-w-sm mb-2">
        We couldn&apos;t connect to the server. This may be a temporary issue — please
        check your connection and try again.
      </p>

      {/* Technical detail */}
      <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-1.5 rounded-lg mb-7 max-w-xs break-all">
        {message}
      </p>

      {/* Retry button */}
      <button
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2E7D32] text-white
                   font-semibold text-sm hover:bg-[#1B5E20] transition-colors
                   focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {retrying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Retrying…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </>
        )}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [budgetRange, setBudgetRange] = useState("All Budgets");
  const [sortBy, setSortBy] = useState("newest");

  // ── Data loading — retryable ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      // Simulate 1.5s network delay
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;

      // First attempt fails to demonstrate the error state.
      // Every subsequent attempt (Retry) succeeds.
      if (SIMULATE_INITIAL_ERROR && loadAttempt === 0) {
        throw new Error("GET /api/jobs — 503 Service Unavailable");
      }

      const data = await import("@/data/jobs.json");
      if (cancelled) return;
      setAllJobs(data.default as Job[]);
      setLoading(false);
    };

    run().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [loadAttempt]);

  const handleRetry = useCallback(() => {
    setLoadAttempt((n) => n + 1);
  }, []);

  // ── Derived filter options ────────────────────────────────────────────────
  const categories = useMemo(() => {
    const unique = [...new Set(allJobs.map((j) => j.category))].sort();
    return ["All Categories", ...unique];
  }, [allJobs]);

  const locations = useMemo(() => {
    const unique = [...new Set(allJobs.map((j) => j.location))].sort();
    return ["All Locations", ...unique];
  }, [allJobs]);

  // ── Filter then sort in one pass ──────────────────────────────────────────
  const displayedJobs = useMemo(() => {
    const selectedRange =
      BUDGET_RANGES.find((r) => r.label === budgetRange) ?? BUDGET_RANGES[0];
    const q = search.trim().toLowerCase();

    const filtered = allJobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.employer.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        category === "All Categories" || job.category === category;

      const matchesLocation =
        location === "All Locations" || job.location === location;

      const matchesBudget =
        job.budget >= selectedRange.min && job.budget <= selectedRange.max;

      return matchesSearch && matchesCategory && matchesLocation && matchesBudget;
    });

    // Sort the filtered set — never the full list
    const copy = [...filtered];
    switch (sortBy) {
      case "budget-desc":
        copy.sort((a, b) => b.budget - a.budget);
        break;
      case "budget-asc":
        copy.sort((a, b) => a.budget - b.budget);
        break;
      case "proposals-desc":
        copy.sort((a, b) => b.proposals - a.proposals);
        break;
      default: // "newest"
        copy.sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
    }
    return copy;
  }, [allJobs, search, category, location, budgetRange, sortBy]);

  function resetFilters() {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setBudgetRange("All Budgets");
    setSortBy("newest");
  }

  const hasActiveFilters =
    search !== "" ||
    category !== "All Categories" ||
    location !== "All Locations" ||
    budgetRange !== "All Budgets";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight">
            Find Your Next Opportunity
          </h1>
          <p className="text-green-100 text-sm sm:text-base mb-7 max-w-xl">
            Browse hundreds of freelance and contract jobs across East Africa.
            Connect with top employers today.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by job title, skill, or employer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-[#F9A825] placeholder-gray-400
                         text-sm sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <span className="text-sm font-semibold text-gray-500 hidden sm:block shrink-0">
              Filter by:
            </span>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm
                         text-gray-700 bg-white focus:outline-none focus:ring-2
                         focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm
                         text-gray-700 bg-white focus:outline-none focus:ring-2
                         focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>

            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              aria-label="Filter by budget range"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm
                         text-gray-700 bg-white focus:outline-none focus:ring-2
                         focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {BUDGET_RANGES.map((r) => <option key={r.label}>{r.label}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-[#E65100]
                           border border-[#E65100] hover:bg-orange-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Count bar + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Count */}
          <p className="text-sm text-gray-600">
            {loading ? (
              <span className="shimmer inline-block h-4 w-40 rounded" />
            ) : error ? (
              <span className="text-red-500 font-medium">Failed to load jobs</span>
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-gray-900">{displayedJobs.length}</span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">{allJobs.length}</span>{" "}
                {allJobs.length === 1 ? "job" : "jobs"}
                {hasActiveFilters && (
                  <span className="text-[#2E7D32] font-medium"> (filtered)</span>
                )}
              </>
            )}
          </p>

          {/* Sort dropdown — only shown when there are results */}
          {!loading && !error && allJobs.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="sort-by"
                className="text-sm font-semibold text-gray-500 whitespace-nowrap"
              >
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700
                           bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]
                           focus:border-[#2E7D32] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : error ? (
            <ErrorBanner
              message={error}
              onRetry={handleRetry}
              retrying={false}
            />
          ) : displayedJobs.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            displayedJobs.map((job) => (
              <JobCard key={job.id} job={job} onOpen={setSelectedJob} />
            ))
          )}
        </div>
      </main>

      {/* Job detail modal */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2E7D32] flex items-center justify-center">
                <span className="text-white font-bold text-xs">HH</span>
              </div>
              <span className="text-white font-semibold text-sm">
                Homeland Ecosystem Hub
              </span>
            </div>
            <p className="text-xs text-center sm:text-right">
              © 2026 HomelandHub.org · Technology · Business · Innovation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
