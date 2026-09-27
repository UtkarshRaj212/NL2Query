"use client";

import { useState, useEffect } from "react";
import type { ThemeId } from "./nlSqlTypes";
import Image from "next/image";
import Logo from "../../public/Logo.png";

import Link from "next/link";

export type NavSection = "workspace" | "download" | "quiz" | "learn" | "help" | "developedBy";

const NAV_ITEMS: { id: NavSection; label: string; icon: (props: { className?: string }) => React.JSX.Element }[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    id: "download",
    label: "Download",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: "learn",
    label: "Learn",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: "help",
    label: "Help",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "developedBy",
    label: "Developed By",
    icon: ({ className = "w-4 h-4" }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

interface AppHeaderProps {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  activeSection?: NavSection;
  onSectionChange?: (section: NavSection) => void;
  mode?: "sql" | "plsql";
}

export function AppHeader({
  theme,
  onThemeChange,
  activeSection = "workspace",
  onSectionChange,
  mode,
}: AppHeaderProps) {
  const isDark = theme !== "pearl";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleNavClick = (sectionId: NavSection) => {
    onSectionChange?.(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 border-b transition-colors gap-3 shrink-0 shadow-xs"
        style={{
          background: "var(--panel)",
          borderColor: "var(--border)",
        }}
      >
        {/* Brand logo & title + Navigation */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          {/* Mobile Hamburger Icon (top left) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-lg border text-zinc-400 hover:text-zinc-100 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-subtle)",
            }}
            aria-label="Open Navigation Menu"
            title="Open Navigation Menu"
          >
            <svg
              className="w-5 h-5 text-[var(--foreground)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              title="Return to Home"
            >
              <Image src={Logo} alt="NL2Query Logo" className="w-8 h-8 sm:w-9 sm:h-9" />
              <h1
                className="text-base font-bold tracking-tight whitespace-nowrap"
                style={{ color: "var(--foreground)" }}
              >
                NL2Query
              </h1>
            </Link>

            {/* Mode Switcher Pill (Desktop/Tablet) */}
            {mode && (
              <div
                className="hidden sm:flex items-center rounded-lg border p-0.5 text-xs font-mono"
                style={{
                  borderColor: isDark ? "var(--border)" : "#cbd5e1",
                  background: isDark ? "var(--surface-subtle)" : "#f1f5f9",
                }}
              >
                <Link
                  href="/sql"
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    mode === "sql"
                      ? isDark
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs font-bold"
                        : "bg-sky-100 text-black border border-sky-400 shadow-xs font-bold"
                      : isDark
                        ? "text-zinc-400 hover:text-zinc-200"
                        : "text-zinc-800 hover:text-black font-semibold"
                  }`}
                >
                  SQL
                </Link>
                <Link
                  href="/plsql"
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    mode === "plsql"
                      ? isDark
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs font-bold"
                        : "bg-orange-100 text-black border border-orange-400 shadow-xs font-bold"
                      : isDark
                        ? "text-zinc-400 hover:text-zinc-200"
                        : "text-zinc-800 hover:text-black font-semibold"
                  }`}
                >
                  PL/SQL
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Top Navigation (Hidden on mobile, placed in left pane) */}
          <nav
            className="hidden md:flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange?.(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all cursor-pointer border whitespace-nowrap font-medium ${
                    isActive
                      ? "font-semibold shadow-xs"
                      : "opacity-80 hover:opacity-100 hover:bg-[var(--surface-hover)]"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "var(--surface-subtle)",
                          borderColor: "var(--accent)",
                          color: "var(--foreground)",
                        }
                      : {
                          background: "transparent",
                          borderColor: "transparent",
                          color: "var(--muted)",
                        }
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={() => onThemeChange(isDark ? "pearl" : "slate")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-95 select-none shrink-0"
        style={{
          background: "var(--surface-subtle)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
        }}
        aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
        title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      >
        {isDark ? (
          <>
            {/* Moon Icon for Dark Mode */}
            <svg
              className="w-3.5 h-3.5 text-indigo-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <span className="font-semibold text-xs">Dark</span>
          </>
        ) : (
          <>
            {/* Sun Icon for Light Mode */}
            <svg
              className="w-3.5 h-3.5 text-amber-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="font-semibold text-xs">Light</span>
          </>
        )}

        {/* Mini Pill Switch Track */}
        <div
          className="w-7 h-4 rounded-full p-0.5 flex items-center transition-colors shrink-0"
          style={{
            background: isDark ? "#3f3f46" : "#cbd5e1",
          }}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              isDark ? "translate-x-3" : "translate-x-0"
            }`}
          />
        </div>
      </button>
    </header>

    {/* Mobile Backdrop Overlay */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
    )}

    {/* Mobile Left Navigation Drawer */}
    <div
      className={`fixed inset-y-0 left-0 w-72 sm:w-80 z-50 md:hidden flex flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
      }`}
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
      }}
    >
      {/* Drawer Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <Image src={Logo} alt="NL2Query Logo" className="w-8 h-8" />
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            NL2Query
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1.5 rounded-lg border text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-subtle)",
          }}
          aria-label="Close Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Switcher inside Drawer */}
      {mode && (
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
            Database Mode
          </p>
          <div
            className="grid grid-cols-2 rounded-xl border p-1 text-xs font-mono"
            style={{
              borderColor: isDark ? "var(--border)" : "#cbd5e1",
              background: isDark ? "var(--surface-subtle)" : "#f1f5f9",
            }}
          >
            <Link
              href="/sql"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-1.5 text-center rounded-lg font-semibold transition-all ${
                mode === "sql"
                  ? isDark
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs font-bold"
                    : "bg-sky-100 text-black border border-sky-400 shadow-xs font-bold"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-800 hover:text-black font-semibold"
              }`}
            >
              SQL
            </Link>
            <Link
              href="/plsql"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-1.5 text-center rounded-lg font-semibold transition-all ${
                mode === "plsql"
                  ? isDark
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs font-bold"
                    : "bg-orange-100 text-black border border-orange-400 shadow-xs font-bold"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-800 hover:text-black font-semibold"
              }`}
            >
              PL/SQL
            </Link>
          </div>
        </div>
      )}

      {/* Drawer Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 py-1 font-mono">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                isActive
                  ? "font-semibold shadow-xs"
                  : "border-transparent opacity-80 hover:opacity-100 hover:bg-[var(--surface-hover)]"
              }`}
              style={
                isActive
                  ? {
                      background: "var(--surface-subtle)",
                      borderColor: "var(--accent)",
                      color: "var(--foreground)",
                    }
                  : {
                      color: "var(--foreground)",
                    }
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent)]" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Drawer Footer with Theme Toggle */}
      <div
        className="p-3.5 border-t flex items-center justify-between"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-subtle)",
        }}
      >
        <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
          Appearance
        </span>

        <button
          type="button"
          onClick={() => onThemeChange(isDark ? "pearl" : "slate")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-95 select-none"
          style={{
            background: "var(--panel)",
            color: "var(--foreground)",
            borderColor: "var(--border)",
          }}
        >
          {isDark ? (
            <>
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Light</span>
            </>
          )}
        </button>
      </div>
    </div>
  </>
);
}
