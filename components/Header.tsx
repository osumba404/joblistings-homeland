"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-[#F9A825]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Homeland Ecosystem Hub home">
            <div className="w-9 h-9 rounded-full bg-[#2E7D32] flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">HH</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[#2E7D32] text-lg leading-none block">Homeland</span>
              <span className="text-[#E65100] text-xs font-medium leading-none">Ecosystem Hub</span>
            </div>
          </Link>

          {/* Desktop navigation — hidden below md breakpoint */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-6 list-none m-0 p-0">
              <li>
                <Link href="/" className="text-gray-700 hover:text-[#2E7D32] font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li>
                {/* aria-current marks the active page for screen readers */}
                <Link
                  href="/"
                  aria-current="page"
                  className="text-[#2E7D32] font-semibold border-b-2 border-[#2E7D32] pb-0.5"
                >
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-700 hover:text-[#2E7D32] font-medium transition-colors">
                  Post a Job
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sign In + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#2E7D32] text-white font-medium text-sm hover:bg-[#1B5E20] transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {/* Two separate SVGs so the icon swap doesn't need JS class toggling */}
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation — conditionally rendered, tied to hamburger button */}
        {mobileMenuOpen && (
          <nav id="mobile-nav" aria-label="Mobile navigation" className="md:hidden border-t border-gray-100 py-3">
            <ul className="space-y-1 list-none m-0 p-0">
              {["Home", "Jobs", "Post a Job", "Sign In"].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-green-50 hover:text-[#2E7D32] font-medium transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
