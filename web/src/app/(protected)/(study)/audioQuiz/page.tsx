//** 音声クイズ（Audio Quiz） */

"use client";

import AudioQuiz from "@/components/learn/AudioQuiz";
import { useTimer } from "@/components/timer/TimerProvider";
import { useEffect, useState} from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AudioQuizPage() {
  const pathname = usePathname();
  const { start, pause, setDurationMin, } = useTimer();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = async () => {
    try {
      const res = await fetch("/api/study-session/start", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to start session");
      const data = await res.json();
      const { sessionId, durationSec } = data;

      setSessionId(sessionId);
      // タイマー設定してからスタート
      setDurationMin(durationSec / 60);
      
      await new Promise((r) => setTimeout(r, 50));

      start();

      // 自動終了予約 (ミリ)
      const durationMs = durationSec * 1000;
      setTimeout(() => {
        console.log("Session time ended automatically");
        endSession(sessionId);
      }, durationMs);

    } catch (err) {
      console.error("Error starting session:", err);

    }
  };

  const endSession = async (sessionId : string) => {
    if (!sessionId) return;

    try {
      const res = await fetch("/api/study-session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
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
      if (sessionId) {
        console.log("🧩 cleanup: endSession 실행");
        endSession(sessionId);
      } else {
        console.log("⚠️ cleanup 시 sessionId가 없음");
      }
    };
  }, [pathname, sessionId]);

  useEffect(() => {
  const handleUnload = () => {
    if (sessionId)
      navigator.sendBeacon(
        "/api/study-session/end",
        JSON.stringify({ sessionId })
      );
  };
  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}, [sessionId]);


  return (
    <main className="relative min-h-screen bg-[#00bf63] flex flex-col items-center px-6 py-10 overflow-hidden">
    
     {/* 상단 제목 */}
      <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">
        今日のクイズ
      </h1>

      <div className="mt-3">
        <AudioQuiz />
      </div>

      {/* 정글 장식 이미지들  */}
      <Image
        src="/animals/monkeys.png"
        alt="원숭이"
        width={160}
        height={160}
        className="absolute top-8 left-6 opacity-90"
      />
      <Image
        src="/animals/snake.png"
        alt="뱀"
        width={130}
        height={130}
        className="absolute bottom-10 right-10 opacity-90"
      />
      <Image
        src="/animals/pond.png"
        alt="연못"
        width={150}
        height={150}
        className="absolute bottom-0 left-12 opacity-90"
      />
    </main>
  );
}
