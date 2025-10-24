"use client";

import { Status, TimerCtx } from "@/types/timer";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

// タイマーCTX
const Ctx = createContext<TimerCtx | null>(null);

export default function TimerProvider({ children }: { children: React.ReactNode }) {
    const [durationMs, setDurationMs] = useState(20 * 60_000); // 초기값 20분(밀리초)
    const [remainingMs, setRemainingMs] = useState(durationMs); // 남은 시간(밀리초)
    const [status, setStatus] = useState<Status>("idle"); //idle = 초기, running = 진행중, paused = 일시정지
    const [endAtMs , setEndAtMs] = useState<number | null>(null); 
    const [now, setNow] = useState(Date.now());
    const [sessionId, setSessionId] = useState<string | null>(null);


    
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
                cancelAnimationFrame(rafIdRef.current); // 진행중이 아니면 루프 중단
                rafIdRef.current = null; // ID 초기화
            }
            return;
        }

        const tick = () => {
            let newRemaining = 0;

            if (endAtMs != null) {
                // 서버/절대시각 기준이 있으면 그걸 우선 사용
                newRemaining = Math.max(0, endAtMs - Date.now());
            } else {
                if (startAtRef.current == null) return;

                const now = performance.now();
                const elapsed = (now - startAtRef.current) + pausedAccumRef.current; // 경과 시간
                newRemaining = Math.max(durationMs - elapsed, 0); // 남은 시간 계산
            }

            setRemainingMs(newRemaining);

            if (newRemaining === 0) {
                // 시간이 다 됐을 때
                setStatus("idle");
                startAtRef.current = null;
                setEndAtMs(null);
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
    }, [status, durationMs, endAtMs]);



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

        //서버 동기화를 위해 절대시각 endAtMs도 함께 기록
        const end = Date.now() + durationMs;
        setEndAtMs(end);
        setRemainingMs(end - Date.now());
    };


    const pause = () => {
        if (status !== "running") return;
        const now = performance.now(); // 정확한 시간 측정을 위해 performance.now() 사용
        if (startAtRef.current != null) {
        const elapsedSinceStart = now - startAtRef.current; // 이번 start~지금까지
        pausedAccumRef.current += elapsedSinceStart;        // 총 경과시간에 누적
        const left = Math.max(0, durationMs - pausedAccumRef.current);
        setRemainingMs(left);      
    }
        // 절대시각은 멈춘 상태에선 의미 없으니 비워둠
        setEndAtMs(null);
        setStatus("paused");
    };


    const resume = () => {
        if (status !== "paused") return;
        // 남은 시간을 절대시각으로 복원 후, 경과계수 초기화
        const next = Date.now() + remainingMs;
        setEndAtMs(next);
        pausedAccumRef.current = 0;         // ★ 추가(혼합 경로 방지)
        startAtRef.current = performance.now(); // 재개 시점만 새로 기록
        setStatus("running");

    };

    const reset = () => {
        setStatus("idle");
        setRemainingMs(durationMs);
        startAtRef.current = null;
        pausedAccumRef.current = 0;
        setEndAtMs(null);
        if (rafIdRef.current != null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    };

    const setEndAtMsSafe = (ms: number) => {
        setEndAtMs(ms);

        // 표시용 남은 시간 즉시 재계산
        setRemainingMs(Math.max(0, ms - Date.now()));
        if (ms > Date.now()) setStatus("running");
        };

        const extendBy = (minutes: number) => {
        const add = Math.max(1, Math.floor(minutes)) * 60_000;
        const base = (endAtMs ?? Date.now());
        const next = base + add;

        // 절대시각 갱신
        setEndAtMs(next);

        // 남은 시간 즉시 반영(낙관적 업데이트)
        setRemainingMs(Math.max(0, next - Date.now()));
        setStatus("running");
    };


    const value = useMemo<TimerCtx>(() => ({
    status, durationMs, remainingMs,endAtMs,
    setDurationMin, start, pause, resume, reset,
    extendBy,
    setEndAtMs: setEndAtMsSafe,
    sessionId, setSessionId,
  }), [status, durationMs, remainingMs, endAtMs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

 export const useTimer = () => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useTimer must be used within a TimerProvider");
    return ctx;
}