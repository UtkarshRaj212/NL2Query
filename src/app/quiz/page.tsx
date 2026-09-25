"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QuizContainer } from "@/components/QuizContainer";

function QuizPageWrapper() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "plsql" ? "plsql" : "sql";

  return <QuizContainer initialMode={mode} />;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading Quiz...</div>}>
      <QuizPageWrapper />
    </Suspense>
  );
}
