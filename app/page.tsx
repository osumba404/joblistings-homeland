"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import EmptyState from "@/components/EmptyState";
import JobModal from "@/components/JobModal";
import type { Job } from "@/types/job";

const BUDGET_RANGES = [
  { label: "All Budgets", min: 0, max: Infinity },
  { label: "Under KES 10,000", min: 0, max: 9999 },
  { label: "KES 10,000 – 30,000", min: 10000, max: 30000 },
  { label: "KES 30,000 – 60,000", min: 30000, max: 60000 },
  { label: "Over KES 60,000", min: 60001, max: Infinity },
];

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [budgetRange, setBudgetRange] = useState("All Budgets");

  // Simulate 1.5s loading delay on initial mount
  useEffect(() => {
    const timer = setTimeout(async () => {
      const data = await import("@/data/jobs.json");
      setAllJobs(data.default as Job[]);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Derive unique filter options from data
  const categories = useMemo(() => {
    const unique = [...new Set(allJobs.map((j) => j.category))].sort();
    return ["All Categories", ...unique];
  }, [allJobs]);

  const locations = useMemo(() => {
    const unique = [...new Set(allJobs.map((j) => j.location))].sort();
    return ["All Locations", ...unique];
  }, [allJobs]);

  // Filtered jobs — computed on every filter/search change
  const filteredJobs = useMemo(() => {
    const selectedRange = BUDGET_RANGES.find((r) => r.label === budgetRange) ?? BUDGET_RANGES[0];
    const q = search.trim().toLowerCase();

    return allJobs.filter((job) => {
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
  }, [allJobs, search, category, location, budgetRange]);

  function resetFilters() {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setBudgetRange("All Budgets");
  }

  const hasActiveFilters =
    search !== "" ||
    category !== "All Categories" ||
    location !== "All Locations" ||
    budgetRange !== "All Budgets";

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
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F9A825] placeholder-gray-400 text-sm sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
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

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Location filter */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {locations.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            {/* Budget range filter */}
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer"
            >
              {BUDGET_RANGES.map((r) => (
                <option key={r.label}>{r.label}</option>
              ))}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-[#E65100] border border-[#E65100] hover:bg-orange-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count + grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {loading ? (
              <span className="shimmer inline-block h-4 w-40 rounded" />
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-gray-900">{filteredJobs.length}</span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">{allJobs.length}</span>{" "}
                {allJobs.length === 1 ? "job" : "jobs"}
                {hasActiveFilters && (
                  <span className="text-[#2E7D32] font-medium"> (filtered)</span>
                )}
              </>
            )}
          </p>
          {!loading && allJobs.length > 0 && (
            <span className="text-xs text-gray-400">Updated daily</span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))
          ) : filteredJobs.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            filteredJobs.map((job) => (
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
