import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
}

function formatBudget(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function daysAgo(dateStr: string): string {
  const posted = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function JobCard({ job, onOpen }: JobCardProps) {
  return (
    /*
     * <article> is correct here because each job card is a self-contained,
     * independently distributable piece of content — the same way a blog post
     * or news item would be marked up.
     */
    <article
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md
                 hover:border-[#2E7D32] transition-all duration-200 flex flex-col h-full group
                 cursor-pointer focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:ring-offset-1"
      onClick={() => onOpen(job)}
    >
      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Category badge + relative post date */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-[#2E7D32] border border-green-200 shrink-0">
            {job.category}
          </span>
          {/*
           * <time> with a machine-readable dateTime attribute lets browsers,
           * search engines, and assistive tech understand the exact date even
           * though the visible label is a relative string like "3 days ago".
           */}
          <time dateTime={job.postedDate} className="text-xs text-gray-400 whitespace-nowrap">
            {daysAgo(job.postedDate)}
          </time>
        </div>

        {/* Job title — h2 because JobCard lives inside <main>, making it a level-2 heading */}
        <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#2E7D32] transition-colors line-clamp-2">
          {job.title}
        </h2>

        {/*
         * <address> inside an <article> represents contact/authorship info for
         * that article. Here the employer is the author/poster of the job listing,
         * making <address> semantically correct per the HTML5 spec.
         */}
        <address className="not-italic text-sm text-gray-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {job.employer}
        </address>

        {/* Budget & Location */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-sm font-semibold text-[#E65100]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatBudget(job.budget)}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        </div>

        {/* Skill tags */}
        <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0" aria-label="Required skills">
          {job.skills.map((skill) => (
            <li key={skill} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">
              {skill}
            </li>
          ))}
        </ul>

        {/* Proposal count */}
        <p className="text-xs text-gray-400 mt-auto">
          <span className="font-semibold text-gray-600">{job.proposals}</span> proposals submitted
        </p>
      </div>

      {/* Apply button */}
      <div className="px-5 pb-5">
        <button
          /*
           * e.stopPropagation() prevents the article's onClick from firing a
           * second time. Without this, clicking Apply triggers both this handler
           * and the card-level handler, which would open the modal twice.
           */
          onClick={(e) => { e.stopPropagation(); onOpen(job); }}
          className="w-full py-2.5 rounded-lg bg-[#2E7D32] text-white font-semibold text-sm
                     hover:bg-[#1B5E20] active:scale-95 transition-all duration-150
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2"
        >
          Apply Now
        </button>
      </div>
    </article>
  );
}
