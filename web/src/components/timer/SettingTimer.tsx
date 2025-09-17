// src/app/(protected)/settings/SettingTimer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function SettingTimer() {
  const [loading, setLoading] = useState(false);
  const [minutesInput, setMinutesInput] = useState<string>(""); // 입력은 문자열로 관리
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // 공통: 숫자 변환 및 검증
  const parsed = minutesInput.trim() === "" ? NaN : Number(minutesInput);
  const isInt = Number.isInteger(parsed);
  const inRange = isInt && parsed >= 5 && parsed <= 120;
  const canSave = !loading && inRange;

  // 마운트 시 설정 불러오기
  useEffect(() => {
    mountedRef.current = true; // 마운트 상태 추적
    const ac = new AbortController();

    (async () => {
      try {
        // signal : ac.signal => 언마운트 시 fetch 취소
        const res = await fetch("/api/settings/time-limit", { signal: ac.signal });
        if (!res.ok) throw new Error("failed to fetch");
        const j = await res.json();
        // 설정이 없으면 20분 기본
        const m = Number(j?.minutesPerSession ?? 20);
        if (!mountedRef.current) return;
        setMinutesInput(String(m));
      } catch (e) {
        if (!mountedRef.current) return;
        setMinutesInput("20");
        setError("設定の取得に失敗しました");
        console.error(e);
      }
    })();

    return () => {
        // 언마운트 시 상태 초기화
      mountedRef.current = false;
      // fetch 취소
      ac.abort();
    };
  }, []);

  // 저장
  async function saveSetting() {
    if (!inRange) {
      setError("5〜120の範囲で入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings/time-limit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutesPerSession: parsed }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "保存に失敗しました");
      }
      if (!mountedRef.current) return;
      setSuccess("保存しました");
      // 2초 후 성공 메시지 자동 숨김
      setTimeout(() => {
        if (mountedRef.current) setSuccess(null);
      }, 2000);
    } catch (e) {
      if (!mountedRef.current) return;
      setError((e as Error).message || "保存に失敗しました");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) saveSetting();
      }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="minutes" className="font-medium">
          時間:
        </label>
        <input
          id="minutes"
          type="number"
          inputMode="numeric"
          min={5}
          max={120}
          step={1}
          value={minutesInput}
          onChange={(e) => {
            setError(null);
            setSuccess(null);
            setMinutesInput(e.target.value);
          }}
          className="w-24 border rounded px-2 py-1"
        />
        <span>分 (5〜120分)</span>
      </div>

      {!inRange && minutesInput !== "" && (
        <p className="text-red-500 text-sm">5〜120の整数で入力してください。</p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={!canSave}
        className="mt-2 px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600"
      >
        {loading ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
