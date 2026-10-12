"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaultyTerminal } from "@/components/FaultyTerminal";

// ── Typewriter heading ─────────────────────────────────────────────────────

function TypewriterHeading({
  text,
  style,
  className,
}: {
  text: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const intervalTime = 900 / text.length;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(t);
    }, intervalTime);
    return () => clearInterval(t);
  }, [text]);
  return (
    <h1 className={className} style={style}>
      {displayed}
    </h1>
  );
}

// ── Subtle vertical divider ────────────────────────────────────────────────

function PanelDivider() {
  return (
    <>
      {/* Desktop */}
      <div
        className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 80%, transparent 100%)",
        }}
      />
      {/* Mobile */}
      <div
        className="flex md:hidden absolute left-0 right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 80%, transparent 100%)",
        }}
      />
    </>
  );
}

// ── Panel button ───────────────────────────────────────────────────────────

function PanelButton({
  href,
  label,
  accentColor,
  borderColor,
  shadowColor,
}: {
  href: string;
  label: string;
  accentColor: string;
  borderColor: string;
  shadowColor: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-250 active:scale-95 select-none"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: `1px solid ${borderColor}`,
        color: "#ffffff",
        backdropFilter: "blur(12px)",
        boxShadow: `0 0 14px ${shadowColor}`,
        fontFamily: "'Outfit', var(--font-geist-sans), sans-serif",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = `rgba(${accentColor}, 0.15)`;
        el.style.boxShadow = `0 0 22px ${shadowColor}`;
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = "rgba(255,255,255,0.07)";
        el.style.boxShadow = `0 0 14px ${shadowColor}`;
        el.style.transform = "translateY(0px)";
      }}
    >
      <span>{label}</span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        className="group-hover:translate-x-0.5 transition-transform duration-200"
      >
        <path
          d="M6.5 2l4.5 4.5-4.5 4.5M2 6.5h9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden bg-[#050810]"
      style={{ fontFamily: "'Outfit', var(--font-geist-sans), sans-serif" }}
    >
      {/* Unified continuous FaultyTerminal WebGL background spanning the full screen */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FaultyTerminal
          tintLeft="#11adc5a4"
          tintRight="#8410a7d9"
          splitRatio={0.5}
          splitSmoothness={0.14}
          splitDirection="auto"
          scale={1}
          gridMul={[2.5, 1.25]}
          digitSize={0.8}
          timeScale={0.5}
          pause={false}
          scanlineIntensity={0.3}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.15}
          mouseReact
          mouseStrength={0.35}
          pageLoadAnimation
          brightness={1.0}
        />
      </div>

      <div className="absolute top-5 sm:top-8 md:top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none text-center w-full px-4">
        <TypewriterHeading
          text="NL2QUERY"
          className="font-extrabold leading-none tracking-tight text-white"
          style={{
            fontSize: "clamp(2.4rem, 6.5vw, 6.5rem)",
            textShadow:
              "0 0 20px rgba(0,0,0,0.5), " +
              "0 0 45px rgba(0,0,0,0.3), " +
              "0 0 70px rgba(0,0,0,0.18)",
            letterSpacing: "-0.01em",
          }}
        />
      </div>

      {/* Subtle vertical / horizontal panel divider */}
      <PanelDivider />

      {/* Split panels container */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row pointer-events-auto">

        {/* ══ LEFT / TOP: SQL ════════════════════════════════════════════ */}
        <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
          {/* Subtle dark radial glow for SQL side */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(0,10,20,0.03) 0%, rgba(5,8,16,0.05) 100%)",
            }}
          />

          {/* Cyan glow at center */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(17,173,197,0.14) 0%, transparent 65%)",
            }}
          />

          {/* Content */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6 sm:px-12 pt-16 sm:pt-20 md:pt-20 pb-2 md:pb-0">
            <div className="flex flex-col items-center gap-2.5 sm:gap-4 text-center">
              {/* Badge */}
              <span
                className="text-[10px] sm:text-xs px-3 py-1 rounded-lg border backdrop-blur-md"
                style={{
                  color: "#c8f6ff",
                  borderColor: "rgba(17,173,197,0.35)",
                  background: "rgba(17,173,197,0.08)",
                  fontFamily: "'JetBrains Mono', var(--font-geist-mono), monospace",
                  letterSpacing: "0.05em",
                }}
              >
                Structured Query Language
              </span>

              {/* Main heading */}
              <TypewriterHeading
                text="SQL"
                className="font-bold leading-none tracking-tight"
                style={{
                  fontSize: "clamp(2.2rem, 5.5vw, 4.75rem)",
                  color: "#F3FBFF",
                  textShadow:
                    "0 0 20px rgba(0,0,0,0.45), " +
                    "0 0 45px rgba(0,0,0,0.28), " +
                    "0 0 70px rgba(0,0,0,0.15)",
                }}
              />

              {/* CTA button */}
              <div className="mt-1 sm:mt-2">
                <PanelButton
                  href="/sql"
                  label="Open SQL"
                  accentColor="17,173,197"
                  borderColor="rgba(17,173,197,0.35)"
                  shadowColor="rgba(17,173,197,0.18)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT / BOTTOM: PL/SQL ═════════════════════════════════════ */}
        <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
          {/* Subtle dark radial glow for PL/SQL side */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(20,5,25,0.03) 0%, rgba(5,8,16,0.05) 100%)",
            }}
          />

          {/* Purple glow at center */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(132,16,167,0.14) 0%, transparent 65%)",
            }}
          />

          {/* Content */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6 sm:px-12 pt-2 sm:pt-4 md:pt-20 pb-10 sm:pb-12 md:pb-0">
            <div className="flex flex-col items-center gap-2.5 sm:gap-4 text-center">
              {/* Badge */}
              <span
                className="text-[10px] sm:text-xs px-3 py-1 rounded-lg border backdrop-blur-md"
                style={{
                  color: "#f3e8ff",
                  borderColor: "rgba(132,16,167,0.35)",
                  background: "rgba(132,16,167,0.08)",
                  fontFamily: "'JetBrains Mono', var(--font-geist-mono), monospace",
                  letterSpacing: "0.05em",
                }}
              >
                Oracle&apos;s procedural extension to SQL
              </span>

              {/* Main heading */}
              <TypewriterHeading
                text="PL/SQL"
                className="font-bold leading-none tracking-tight"
                style={{
                  fontSize: "clamp(2.2rem, 5.5vw, 4.75rem)",
                  color: "#FDF4FF",
                  textShadow:
                    "0 0 20px rgba(0,0,0,0.45), " +
                    "0 0 45px rgba(0,0,0,0.28), " +
                    "0 0 70px rgba(0,0,0,0.15)",
                }}
              />

              {/* CTA button */}
              <div className="mt-1 sm:mt-2">
                <PanelButton
                  href="/plsql"
                  label="Open PL/SQL"
                  accentColor="132,16,167"
                  borderColor="rgba(132,16,167,0.4)"
                  shadowColor="rgba(132,16,167,0.2)"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
