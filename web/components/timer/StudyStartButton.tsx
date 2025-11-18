"use client";

import { useTimer } from "./TimerProvider";
import { useRouter } from "next/navigation";


type Props = {
  /** 시작 후 이동할 경로 (선택). 예: "/lessons" */
  redirectTo?: string;
  className?: string;
  labelStart?: string;   // 기본: 勉強開始
  labelPause?: string;   // 기본: 一時停止
  labelReset?: string;   // 기본: リセット
  onStart?: () => void;  
};

export default function StudyStartButton({
  redirectTo,
  className = "rounded-xl bg-black text-white px-4 py-2",
  labelStart = "勉強開始",
  labelPause = "一時停止",
  labelReset = "リセット",
  onStart,
}: Props) {
  const { status, start, pause, reset, resume } = useTimer();
  const router = useRouter();

  if (status !== "running") {
    return (
        
      <button
        className={className}
        onClick={() => {
          if (status === "idle") {
            start();
          } else if (status === "paused") resume();

          if (redirectTo) router.push(redirectTo);
          if (onStart) onStart();
        }}
      >
        {labelStart}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={pause} className="rounded-xl border px-3 py-2">
        {labelPause}
      </button>
      <button onClick={reset} className="rounded-xl border px-3 py-2">
        {labelReset}
      </button>
    </div>
  );
}
