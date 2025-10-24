"use client";

import LearningCard from "@/components/learn/LearningCard";
import { useTimer } from "@/components/timer/TimerProvider";
import { useEffect } from "react";

export default function LessonsPage() {
  const { start,pause, remainingMs, durationMs } = useTimer();

  useEffect(() => {
  start(); // Timer start
  // fetch("/api/study-session", { method: "POST" }); // 세션 시작 API
}, []); // dependency는 빈 배열


  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">今日のカード</h1>
          <div className="mt-3">
            <LearningCard />
          </div>
    </main>
  );
}
