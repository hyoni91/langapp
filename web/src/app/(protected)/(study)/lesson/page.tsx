//** 今日の単語（Vocabulary of the Day）*/

"use client";

import LearningCard from "@/components/learn/LearningCard";
import { useTimer } from "@/components/timer/TimerProvider";
import { useEffect, useState} from "react";


export default function LessonsPage() {
  const { start,pause, setDurationMin, } = useTimer();
  const [sessionId, setSessionId] = useState<string | null>(null);



  const startSession = async () => {
    try {
      const res = await fetch("/api/study-session/start", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to start session");
      const data = await res.json();
      setSessionId(data.sessionId);
      console.log("Started session:", data.sessionId);

      // タイマー設定してからスタート
      const remainingMs = new Date(data.willEndAt).getTime() - Date.now() * 60 * 1000; 
      setDurationMin(remainingMs); 
      start();

      // セッション終了のタイマーセット
      setTimeout(() => endSession(), remainingMs);

          setTimeout(() => {
      console.log("Timer fired, ending session");
      endSession();
    }, remainingMs);
      
    } catch (err) {
      console.error(err);
    }
  };



  const endSession = async () => {
    if (!sessionId) return;

    try {
      const res = await fetch("/api/study-session/end", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to end session");
    } catch (err) {
      console.error(err);
    }
  };

  

  useEffect(() => {
    startSession();

    return () => {
      pause();
      endSession();
    };

  }, []);


  return (
    <main className="relative min-h-screen bg-orange-200 flex flex-col items-center px-6 py-10 overflow-hidden"
>
       {/* 상단 제목 */}
      <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">
        今日の単語 
      </h1>
          <div className="mt-3">
            <LearningCard />
          </div>
    </main>
  );
}
