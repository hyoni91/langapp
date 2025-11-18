// タイマーの状態
export type Status = "idle"  // 待機中（未開始／リセット直後）
  | "running"                // カウント中
  | "paused";                // 一時停止中

// タイマー用コンテキストの型
export type TimerCtx = {
  status: Status;            // 現在の状態
  sessionId : string | null; //

  durationMs: number;        // 今回のセッションの長さ（ミリ秒）
  remainingMs: number;       // 残り時間（ミリ秒）
  endAtMs: number | null;    // 終了予定時刻（UNIX ms）。未設定なら null

  setSessionId: (id: string | null) => void;  //
  setDurationMin: (m: number) => void; // デフォルトのセッション分数を更新（※自動開始しない）
  start: () => void;                    // ユーザー操作で開始する
  pause: () => void;                    // 一時停止
  resume: () => void;                   // 再開
  reset: () => void;                    // リセット（残り時間クリア＆idleへ）

  extendBy: (minutes: number) => void;  // 残り時間を n 分だけ延長（UI 即時反映）
  setEndAtMs: (ms: number) => void;     // サーバー応答で endAt を補正するときに使用
};
