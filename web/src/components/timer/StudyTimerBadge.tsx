"use client";

import { useEffect, useMemo, useState } from "react";
import { useTimer } from "./TimerProvider";



type Props = {
  // 종료하면 모달 표시(부모 컴포넌트에서 처리) //현재미사용 null 처리
  onEnd: () => void;
};

function fmt(ms: number) {
  const s = Math.ceil(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function StudyTimerBadge({onEnd}: Props) {
  const { status, remainingMs, setDurationMin, reset} = useTimer();
  const [open, setOpen] = useState(false);
  


  // 종료 감지: running→idle로 넘어가며 0이 된 순간 모달 오픈
  const isOver = useMemo(() => status === "idle" && remainingMs === 0, [status, remainingMs]);

  useEffect(() => {
    if (isOver) setOpen(true);
  }, [isOver]);

  // idle(초기)일 땐 배지 숨김, paused/running일 때만 배지 노출
  // const showBadge = status === "running" || status === "paused";
  // if (!showBadge && !open) return null;

  // 일시정지 상태일 땐 항상 표시, 그 외엔 열려있을 때 또는 실행중일 때만 표시  
  const showBadge = status !== "paused" ? (status === "running" || open) : true;


  return (
    <>

      {showBadge && (
        <div
          className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black text-white px-4 py-2 shadow"
          role="status"
          aria-live="polite"
        >
          残り時間: <b className="tabular-nums">{fmt(remainingMs)}</b>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2">⏰ 終了時間</h2>
            <p className="text-gray-600 mb-4">学習時間が終了しました。</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  // 연장: “세션 길이”를 5분으로 재설정만 하고(자동 시작 X),
                  // 사용자가 Start 버튼으로 다시 시작하게 하는 정책
                  setDurationMin(5);
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-2 border"
              >
                5分延長
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  reset(); // 남은시간 초기화(idle)
                  onEnd();
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
