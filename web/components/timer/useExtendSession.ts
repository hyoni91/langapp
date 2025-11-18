//** 延長Hooks サーバー反映   전역관리 이거 대신 따로 관리하는 useStudySession안에 연장함수 사용중 */
"use client";
import { useState } from "react";
import { useTimer } from "./TimerProvider";

type Opts = {
  sessionId: string;
  onError?: (e: unknown) => void;
};

export function useExtendSession({ sessionId, onError }: Opts) {
  const { extendBy, setEndAtMs } = useTimer(); //時間延長、サーバー応答で endAt を補正するときに使用
  const [loading, setLoading] = useState(false);

  async function extend(minutes: number) { //延長時間
    try {
      setLoading(true);
      // 1) 낙관적 업데이트 (UI 즉시 +minutes)
      extendBy(minutes);

      // 2) 서버 반영
      const res = await fetch(`/api/study-session/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({sessionId, addMinutes: minutes }),
      });
      if (!res.ok) throw new Error(`Extend failed: ${res.status}`);
      const json = await res.json(); // { endedAt, remainingSec }

      // 3) 서버 기준으로 교정(선택: 서버/클라 시계 오차 보정)
      const serverEnd = new Date(json.endedAt).getTime();
      setEndAtMs(serverEnd);
    } catch (e) {
      onError?.(e);
      // 실패 롤백이 필요하면 여기서 처리
    } finally {
      setLoading(false);
    }
  }

  return { extend, loading };
}
