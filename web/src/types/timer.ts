export type Status = "idle" | "running" | "paused";

export type TimerCtx = {
  status: Status;
  durationMs: number;     // 이번 세션 길이
  remainingMs: number;    // 남은 시간
  setDurationMin: (m: number) => void; // 설정만 바꿈(자동 시작 X)
  start: () => void;      // 사용자 액션으로만 시작
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

