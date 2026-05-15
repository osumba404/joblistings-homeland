"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Job } from "@/types/job";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobModalProps {
  job: Job;
  onClose: () => void;
}

interface FormValues {
  coverLetter: string;
  proposedBudget: string;
  timeline: string;
  portfolioUrl: string;
}

interface FormErrors {
  coverLetter?: string;
  proposedBudget?: string;
  timeline?: string;
  portfolioUrl?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.coverLetter.trim()) {
    errors.coverLetter = "Cover letter is required.";
  } else if (values.coverLetter.trim().length < 100) {
    errors.coverLetter = `Must be at least 100 characters (${values.coverLetter.trim().length} / 100).`;
  }

  if (!values.proposedBudget.trim()) {
    errors.proposedBudget = "Proposed budget is required.";
  } else if (isNaN(Number(values.proposedBudget)) || Number(values.proposedBudget) <= 0) {
    errors.proposedBudget = "Enter a valid amount greater than 0.";
  }

  if (!values.timeline.trim()) {
    errors.timeline = "Timeline is required.";
  } else {
    const days = Number(values.timeline);
    if (!Number.isInteger(days) || days <= 0) {
      errors.timeline = "Enter a whole number of days greater than 0.";
    }
  }

  if (values.portfolioUrl.trim()) {
    try {
      new URL(values.portfolioUrl.trim());
    } catch {
      errors.portfolioUrl = "Enter a valid URL (e.g. https://myportfolio.com).";
    }
  }

  return errors;
}

// ─── Star Rating display ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= full;
        const half = !filled && hasHalf && i === full + 1;
        return (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${filled ? "text-[#F9A825]" : half ? "text-[#F9A825]" : "text-gray-300"}`}
            fill={filled || half ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={filled || half ? 0 : 1.5}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
      <span className="text-xs text-gray-500 ml-1 font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Reusable form field wrapper ──────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function Field({ id, label, optional, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
        {label}
        {optional && (
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        )}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white
   focus:outline-none focus:ring-2 transition-colors
   ${hasError
    ? "border-red-400 focus:ring-red-300 focus:border-red-400"
    : "border-gray-300 focus:ring-[#2E7D32]/40 focus:border-[#2E7D32]"
  }`;

// ─── Confirmation state ───────────────────────────────────────────────────────

function ConfirmationState({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Proposal Submitted!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Your proposal for{" "}
          <span className="font-semibold text-gray-700">{job.title}</span> has been sent
          to <span className="font-semibold text-gray-700">{job.employer}</span>.
        </p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-1">
        <p className="text-xs text-gray-500">What happens next?</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-[#2E7D32] font-bold mt-0.5">1.</span>
            The employer reviews your proposal within 3 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2E7D32] font-bold mt-0.5">2.</span>
            You will be notified by email if shortlisted.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2E7D32] font-bold mt-0.5">3.</span>
            A contract is issued upon mutual agreement.
          </li>
        </ul>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-lg bg-[#2E7D32] text-white font-semibold text-sm
                   hover:bg-[#1B5E20] transition-colors focus:outline-none focus:ring-2
                   focus:ring-[#2E7D32] focus:ring-offset-2"
      >
        Back to Jobs
      </button>
    </div>
  );
}

// ─── Proposal form ────────────────────────────────────────────────────────────

interface ProposalFormProps {
  job: Job;
  form: FormValues;
  errors: FormErrors;
  visibleErrors: FormErrors;
  touched: Partial<Record<keyof FormValues, boolean>>;
  submitting: boolean;
  onChange: (field: keyof FormValues, value: string) => void;
  onBlur: (field: keyof FormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ProposalForm({
  job,
  form,
  visibleErrors,
  submitting,
  onChange,
  onBlur,
  onSubmit,
}: ProposalFormProps) {
  const charCount = form.coverLetter.trim().length;
  const charOk = charCount >= 100;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-bold text-gray-900">Submit Your Proposal</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Budget up to{" "}
          <span className="font-semibold text-[#E65100]">
            KES {job.budget.toLocaleString("en-KE")}
          </span>
        </p>
      </div>

      {/* Cover Letter */}
      <Field
        id="cover-letter"
        label="Cover Letter"
        error={visibleErrors.coverLetter}
        hint="Explain why you're the right fit for this role."
      >
        <div className="relative">
          <textarea
            id="cover-letter"
            name="cover-letter"
            rows={5}
            value={form.coverLetter}
            onChange={(e) => onChange("coverLetter", e.target.value)}
            onBlur={() => onBlur("coverLetter")}
            aria-describedby={visibleErrors.coverLetter ? "cover-letter-error" : undefined}
            aria-invalid={!!visibleErrors.coverLetter}
            placeholder="Describe your relevant experience and why you're a great fit..."
            className={`${inputClass(!!visibleErrors.coverLetter)} resize-none`}
          />
          <span
            className={`absolute bottom-2 right-3 text-xs font-medium tabular-nums
              ${charOk ? "text-[#2E7D32]" : charCount > 0 ? "text-orange-500" : "text-gray-400"}`}
          >
            {charCount} / 100
          </span>
        </div>
      </Field>

      {/* Proposed Budget */}
      <Field
        id="proposed-budget"
        label="Your Proposed Budget (KES)"
        error={visibleErrors.proposedBudget}
      >
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm pointer-events-none">
            KES
          </span>
          <input
            id="proposed-budget"
            name="proposed-budget"
            type="number"
            min={1}
            value={form.proposedBudget}
            onChange={(e) => onChange("proposedBudget", e.target.value)}
            onBlur={() => onBlur("proposedBudget")}
            aria-invalid={!!visibleErrors.proposedBudget}
            placeholder="e.g. 40000"
            className={`${inputClass(!!visibleErrors.proposedBudget)} pl-12`}
          />
        </div>
      </Field>

      {/* Timeline */}
      <Field
        id="timeline"
        label="Your Proposed Timeline (days)"
        error={visibleErrors.timeline}
      >
        <div className="relative">
          <input
            id="timeline"
            name="timeline"
            type="number"
            min={1}
            step={1}
            value={form.timeline}
            onChange={(e) => onChange("timeline", e.target.value)}
            onBlur={() => onBlur("timeline")}
            aria-invalid={!!visibleErrors.timeline}
            placeholder="e.g. 21"
            className={`${inputClass(!!visibleErrors.timeline)} pr-14`}
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs pointer-events-none">
            days
          </span>
        </div>
      </Field>

      {/* Portfolio URL */}
      <Field
        id="portfolio-url"
        label="Portfolio / Work Samples URL"
        optional
        error={visibleErrors.portfolioUrl}
        hint="Link to your portfolio, GitHub, Behance, or a relevant project."
      >
        <input
          id="portfolio-url"
          name="portfolio-url"
          type="url"
          value={form.portfolioUrl}
          onChange={(e) => onChange("portfolioUrl", e.target.value)}
          onBlur={() => onBlur("portfolioUrl")}
          aria-invalid={!!visibleErrors.portfolioUrl}
          placeholder="https://yourportfolio.com"
          className={inputClass(!!visibleErrors.portfolioUrl)}
        />
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-[#2E7D32] text-white font-bold text-sm
                   hover:bg-[#1B5E20] active:scale-[0.98] transition-all duration-150
                   focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting…
          </>
        ) : (
          "Submit Proposal"
        )}
      </button>
    </form>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function JobModal({ job, onClose }: JobModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<FormValues>({
    coverLetter: "",
    proposedBudget: "",
    timeline: "",
    portfolioUrl: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(form);

  // Only show errors for touched fields (or all fields after submit attempt)
  const visibleErrors: FormErrors = {};
  (Object.keys(errors) as (keyof FormErrors)[]).forEach((key) => {
    if (touched[key]) visibleErrors[key] = errors[key];
  });

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus the close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Focus trap — cycle Tab/Shift+Tab within the panel
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", handler);
    return () => panel.removeEventListener("keydown", handler);
  }, []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const handleChange = useCallback((field: keyof FormValues, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof FormValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Reveal all errors on submit attempt
    setTouched({ coverLetter: true, proposedBudget: true, timeline: true, portfolioUrl: true });
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // mock API
    setSubmitting(false);
    setSubmitted(true);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

  const formatBudget = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-job-title"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* ── Modal header ── */}
        <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-[#2E7D32] border border-green-200 mb-1.5">
              {job.category}
            </span>
            <h2
              id="modal-job-title"
              className="text-base sm:text-lg font-bold text-gray-900 leading-snug"
            >
              {job.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close job detail"
            className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                       transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-100">

            {/* ── Left: Job details ── */}
            <div className="p-6 space-y-5 border-b lg:border-b-0 border-gray-100">

              {/* Employer card */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-11 h-11 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {job.employer.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{job.employer}</p>
                  <StarRating rating={job.employerRating} />
                  <p className="text-xs text-gray-400 mt-1">
                    {job.proposals} proposals · Posted {formatDate(job.postedDate)}
                  </p>
                </div>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Budget
                  </p>
                  <p className="font-bold text-[#E65100] text-sm">{formatBudget(job.budget)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Deadline
                  </p>
                  <p className="font-bold text-blue-700 text-sm">{formatDate(job.deadline)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Location
                  </p>
                  <p className="font-bold text-gray-800 text-sm">{job.location}</p>
                </div>
              </div>

              {/* Full description */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">About This Job</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-[#2E7D32] border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Proposal form / confirmation ── */}
            <div className="p-6">
              {submitted ? (
                <ConfirmationState job={job} onClose={onClose} />
              ) : (
                <ProposalForm
                  job={job}
                  form={form}
                  errors={errors}
                  visibleErrors={visibleErrors}
                  touched={touched}
                  submitting={submitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
