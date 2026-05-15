export default function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 h-[320px]">
      {/* Category badge + date */}
      <div className="flex items-center justify-between">
        <div className="shimmer h-5 w-28 rounded-full" />
        <div className="shimmer h-4 w-16 rounded" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="shimmer h-5 w-full rounded" />
        <div className="shimmer h-5 w-3/4 rounded" />
      </div>
      {/* Employer */}
      <div className="shimmer h-4 w-40 rounded" />
      {/* Budget + location */}
      <div className="flex gap-3">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer h-4 w-20 rounded" />
      </div>
      {/* Skills */}
      <div className="flex gap-2">
        <div className="shimmer h-5 w-16 rounded" />
        <div className="shimmer h-5 w-20 rounded" />
        <div className="shimmer h-5 w-14 rounded" />
      </div>
      {/* Proposals */}
      <div className="shimmer h-4 w-36 rounded mt-auto" />
      {/* Button */}
      <div className="shimmer h-10 w-full rounded-lg mt-1" />
    </div>
  );
}
