import { useTimer } from "@/components/timer/TimerProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export function useStudySession (){
    const pathname = usePathname();
    const { start, pause, setDurationMin, setEndAtMs } = useTimer();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);


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
        
        start();

        // 自動終了予約 (ミリ)
        const durationMs = durationSec * 1000;
        const id = setTimeout(() => endSession(sessionId), durationMs);
        setTimeoutId(id);

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

    const extendSession = async (minutes = 5 ) => {
    
        if (!sessionId) return toast.error("セッション情報が見つかりません。");;
        try{
            const res = await fetch(`/api/study-session/${sessionId}/extend`,{
                method : "POST",
                headers : { "Content-type" : "application/json" },
                body: JSON.stringify({ addMinutes: minutes }),
            });

            if(!res.ok) throw new Error("延長失敗");
            const data = await res.json();

            // 타이머 동기화 (Provider에 연결)
            const nextEndMs = new Date(data.endedAt).getTime();
            setEndAtMs(nextEndMs);

             if (timeoutId) clearTimeout(timeoutId); // 기존 타이머 제거

            // 새 타이머 다시 설정
            const addMs = minutes * 60_000;
            const id = setTimeout(() => endSession(sessionId), addMs);
            setTimeoutId(id);

        }catch(error){
            console.error("extendSession error:", error);
        }
    }


    useEffect(() => {
      startSession();

      return () => {
        pause();
        if (timeoutId) clearTimeout(timeoutId);
        if (sessionId) endSession(sessionId);
      };
    }, [pathname]);

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

  return { sessionId, startSession, endSession, extendSession }
}