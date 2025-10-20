"use client";

import LearningCard from "@/components/learning/LearningCard";
import StudyTimerBadge from "@/components/timer/StudyTimerBadge";
import StudyStartButton from "@/components/timer/StudyStartButton";
import { useState } from "react";

export default function LessonsPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleStart = (() =>  { 
    setHasStarted(true);
    setShowModal(false);
  });


  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">今日のカード</h1>

      {/* 모달 */}
      {
        showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-2">学習を始めますか？</h2>
              <StudyStartButton onStart={handleStart} />
            </div>
          </div>
        )
      }

      {/* 공부 시작 후에만 카드와 타이머 표시 */}
      {hasStarted && (
        <>
          <div className="mt-3">
            <StudyStartButton />
            <LearningCard />
          </div>
          <StudyTimerBadge onEnd={() => setShowModal(true)} />
        </>
      )}
    </main>
  );
}
