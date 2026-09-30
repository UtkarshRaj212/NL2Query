"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ExamView } from "@/components/ExamView";
import type { ThemeId } from "@/components/nlSqlTypes";

function ExamPageWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const initialMode = modeParam === "plsql" ? "plsql" : "sql";

  const [theme, setTheme] = useState<ThemeId>("slate");

  useEffect(() => {
    // Check saved theme or default
    const savedTheme = localStorage.getItem("nlp-sql-theme") as ThemeId;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme !== "pearl");
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme);
    localStorage.setItem("nlp-sql-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme !== "pearl");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <AppHeader
        theme={theme}
        onThemeChange={handleThemeChange}
        activeSection="exam"
        onSectionChange={(section) => {
          if (section === "workspace") {
            router.push(initialMode === "sql" ? "/sql" : "/plsql");
          } else if (section === "quiz") {
            router.push(`/${initialMode}/quiz`);
          } else if (section === "download" || section === "learn" || section === "help") {
            router.push(`/${initialMode}`);
          }
        }}
        mode={initialMode}
      />

      {/* Main Exam Section */}
      <ExamView
        initialMode={initialMode}
        onBackToWorkspace={() => router.push(initialMode === "sql" ? "/sql" : "/plsql")}
      />
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center font-mono text-sm text-[var(--muted)]">
          Loading Exam PYQ Section...
        </div>
      }
    >
      <ExamPageWrapper />
    </Suspense>
  );
}
