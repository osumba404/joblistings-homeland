interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-[#2E7D32]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
      <p className="text-gray-500 max-w-sm mb-6">
        No jobs match your current filters. Try adjusting your search or clearing
        the filters to see all available opportunities.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-lg bg-[#2E7D32] text-white font-semibold hover:bg-[#1B5E20] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2"
      >
        Clear All Filters
      </button>
    </div>
  );
}
