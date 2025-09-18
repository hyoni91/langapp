//삭제예정 TimerProvider로 대체

"use client";

import { useCountdownInterval } from "@/hooks/useCountdownInterval";
import { useEffect, useState } from "react";

export default function AutoStarter(){
    const [durationMs, setDurationMs] = useState<number | null>(null);
    const { label, isOver } = useCountdownInterval(durationMs);
    const [open, setOpen] = useState(false);

      // 보호페이지 진입 시 자동 시작: 설정에서 분 수 가져와서 시작
    useEffect(()=>{
        let alive = true;
        (async()=>{
            try{
                const res = await fetch("/api/sessions/auto-start",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ }),
                });
                if(!res.ok) throw new Error("failed to fetch" );
                const j = await res.json();
                const minutes = Number(j.minutesPerSession ?? 20);
                if(!alive) return;
                setDurationMs(minutes * 60_000) // minutes 분 -> 밀리초
            }catch(e){
                setDurationMs(20 * 60_000); // 실패 시 20분 기본(밀리초)
            }

        })();
        return () => {
            alive = false;
        };
    }, []);

    // 시간이 다 됐을 때 알림창 띄우기
    useEffect(()=>{
        if(isOver) setOpen(true);
    },[isOver]);

    if (durationMs == null) return null; // 아직 시작 전 로딩


    return (
    <>
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black text-white px-4 py-2 shadow">
        残り時間: <b className="tabular-nums">{label}</b>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2">⏰終了時間</h2>
            <p className="text-gray-600 mb-4">学習時間が終了しました。</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  // 5분 연장: 현재 시점부터 5분 카운트다운 다시 시작
                  setDurationMs(5 * 60_000);
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-2 border"
              >
                5分延長
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setDurationMs(null); // 표시 종료
                  // 필요하면 여기서 /api/sessions/end 호출
                }}
                className="rounded-xl px-4 py-2 bg-black text-white"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}