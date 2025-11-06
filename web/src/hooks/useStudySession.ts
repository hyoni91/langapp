import { useTimer } from "@/components/timer/TimerProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useStudySession (){
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
          endSession(sessionId);
        } else {
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

  return { sessionId, startSession, endSession }
}