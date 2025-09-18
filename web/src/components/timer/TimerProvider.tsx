"use client";

import { Status, TimerCtx } from "@/types/timer";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

// 타이머 컨텍스트
const Ctx = createContext<TimerCtx | null>(null);

export default function TimerProvider({ children }: { children: React.ReactNode }) {
    const [durationMs, setDurationMs] = useState(20 * 60_000); // 초기값 20분(밀리초)
    const [remainingMs, setRemainingMs] = useState(durationMs); // 남은 시간(밀리초)
    const [status, setStatus] = useState<Status>("idle"); //idle = 초기, running = 진행중, paused = 일시정지

    const startAtRef = useRef<number | null>(null); // 타이머 시작 시점
    const pausedAccumRef = useRef<number>(0); // 일시정지 누적 시간을 ms 단위로 저장
    const rafIdRef = useRef<number | null>(null); // requestAnimationFrame ID

    // 설정 불러오기 (초기 1회)
    useEffect(()=>{
        let cancelled = false;
        (async()=>{
            try{
                const res = await fetch("/api/settings/time-limit");
                if(!res.ok) throw new Error("failed to fetch" );
                const j = await res.json();
                const minutes = Number(j.minutesPerSession ?? 20);
                if(cancelled) return;
                setDurationMs(minutes * 60_000); // minutes 분 -> 밀리초
                setRemainingMs(minutes * 60_000); // 남은 시간도 같이 설정
            }catch(e){
                console.error(e);
            }
        })();
        return () => { cancelled = true; };
    },[])


    // 틱 루프 (requestAnimationFrame)
    useEffect(() => {
        if (status !== "running") {
            if (rafIdRef.current != null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            return;
        }

        const tick = () => {
            if (startAtRef.current == null) return;

            const now = performance.now();
            const elapsed = now - startAtRef.current - pausedAccumRef.current;
            const newRemaining = Math.max(durationMs - elapsed, 0); // 남은 시간 계산

            setRemainingMs(newRemaining);

            if (newRemaining === 0) {
                // 시간이 다 됐을 때
                setStatus("idle");
                startAtRef.current = null;
                pausedAccumRef.current = 0;
                rafIdRef.current = null;
                return;
            }

            rafIdRef.current = requestAnimationFrame(tick);        };
        
        rafIdRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafIdRef.current != null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [status, durationMs]);



    // 컨트롤 (외부에서 호출하는 함수들)
    // setDurationMin: 설정만 바꿈(자동 시작 X)
    // start: 사용자 액션으로만 시작
    // pause: 일시정지
    // resume: 다시 시작
    // reset: 처음부터 다시
    const setDurationMin = (m: number) => {
        const ms = Math.max(1, Math.floor(m)) * 60_000; // 최소 1분
        setDurationMs(ms); 
        if (status !== "running") {
            setRemainingMs(ms); // 진행중이 아닐 때만 남은 시간도 같이 설정
        }
    };


    const start = () => {
        if (status === "running") return;   

        setStatus("running");
        startAtRef.current = performance.now();
        pausedAccumRef.current = 0;
        setRemainingMs(durationMs);
    };


    const pause = () => {
        if (status !== "running") return;
        const now = performance.now(); // 정확한 시간 측정을 위해 performance.now() 사용
        if (startAtRef.current != null) {
        // 현재까지의 경과를 반영하여 remaining 업데이트
        const elapsed = now - startAtRef.current - pausedAccumRef.current;
         const left = Math.max(0, durationMs - elapsed);
        setRemainingMs(left);
         // 이후 재개 시점을 위해 누적 보정 갱신
        pausedAccumRef.current = durationMs - left; // == 총 경과시간
        }
        setStatus("paused");
    };


    const resume = () => {
        if (status !== "paused" || pausedAccumRef.current == null || startAtRef.current == null) return;

        if (startAtRef.current == null) startAtRef.current = performance.now(); // 안전장치
        pausedAccumRef.current = durationMs - remainingMs;
        setStatus("running");

    };

    const reset = () => {
        setStatus("idle");
        setRemainingMs(durationMs);
        startAtRef.current = null;
        pausedAccumRef.current = 0;
        if (rafIdRef.current != null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    };

    const value = useMemo<TimerCtx>(() => ({
    status, durationMs, remainingMs,
    setDurationMin, start, pause, resume, reset
  }), [status, durationMs, remainingMs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

 export const useTimer = () => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useTimer must be used within a TimerProvider");
    return ctx;
}