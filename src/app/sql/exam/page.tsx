"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ExamView } from "@/components/ExamView";
import type { ThemeId } from "@/components/nlSqlTypes";

export default function SqlExamPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeId>("slate");

  useEffect(() => {
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
    <div data-page="sql" className="page-sql h-screen flex flex-col overflow-hidden">
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading SQL Exam PYQs...</div>}>
        <AppHeader
          theme={theme}
          onThemeChange={handleThemeChange}
          activeSection="exam"
          onSectionChange={(section) => {
            if (section === "workspace") {
              router.push("/sql");
            } else if (section === "quiz") {
              router.push("/sql/quiz");
            } else {
              router.push("/sql");
            }
          }}
          mode="sql"
        />
        <ExamView
          initialMode="sql"
          onBackToWorkspace={() => router.push("/sql")}
        />
      </Suspense>
    </div>
  );
}
