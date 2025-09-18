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
};

export default function StudyStartButton({
  redirectTo,
  className = "rounded-xl bg-black text-white px-4 py-2",
  labelStart = "勉強開始",
  labelPause = "一時停止",
  labelReset = "リセット",
}: Props) {
  const { status, start, pause, reset } = useTimer();
  const router = useRouter();

  if (status !== "running") {
    return (
      <button
        className={className}
        onClick={() => {
          start();                // ← 여기서만 시작
          if (redirectTo) router.push(redirectTo);
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
