"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ExamView } from "@/components/ExamView";
import type { ThemeId } from "@/components/nlSqlTypes";

export default function PlSqlExamPage() {
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
    <div data-page="plsql" className="page-plsql h-screen flex flex-col overflow-hidden">
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading PL/SQL Exam PYQs...</div>}>
        <AppHeader
          theme={theme}
          onThemeChange={handleThemeChange}
          activeSection="exam"
          onSectionChange={(section) => {
            if (section === "workspace") {
              router.push("/plsql");
            } else if (section === "quiz") {
              router.push("/plsql/quiz");
            } else {
              router.push("/plsql");
            }
          }}
          mode="plsql"
        />
        <ExamView
          initialMode="plsql"
          onBackToWorkspace={() => router.push("/plsql")}
        />
      </Suspense>
    </div>
  );
}
