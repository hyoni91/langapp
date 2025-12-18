// ** 設定タイマー */
"use client";

import { useEffect, useRef, useState } from "react";

export default function SettingTimer() {
  const [loading, setLoading] = useState(false);
  const [minutesInput, setMinutesInput] = useState<string>(""); //入力は文字列で管理
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // 共通: 数字変換および検証
  const parsed = minutesInput.trim() === "" ? NaN : Number(minutesInput);
  const isInt = Number.isInteger(parsed);
  const inRange = isInt && parsed >= 5 && parsed <= 120;
  const canSave = !loading && inRange;

  // マウント時に設定を読み込む
  useEffect(() => {
    mountedRef.current = true; // マウント状態を追跡
    const ac = new AbortController();

    (async () => {
      try {
        // signal : ac.signal => アンマウント時にfetchをキャンセル
        const res = await fetch("/api/settings/time-limit", { signal: ac.signal });
        if (!res.ok) throw new Error("failed to fetch");
        const j = await res.json();
        // 設定が無ければ20分を基本
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
        // アンマウント時に状態を初期化
      mountedRef.current = false;
      // fetchをキャンセル
      ac.abort();
    };
  }, []);

  // 保存
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
      // 2秒後成功メッセージ自動非表示
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
    className="space-y-3 text-center"
  >
    <div className="flex justify-center items-center gap-3">
      <label htmlFor="minutes" className="font-medium text-lg">
        {/* 時間： */}
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
        className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-center text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      <span className="font-medium text-lg">分</span>

      <button
        type="submit"
        disabled={!canSave}
        className="w-20 px-6 py-2.5 rounded-xl text-white font-medium bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "保存中..." : "保存"}
      </button>
    </div>

    {/* メッセージ領域固定 */}
    <div className="h-5 mt-1">
      {inRange === false && minutesInput !== "" && (
        <p className="text-red-500 text-sm">5〜120の整数で入力してください。</p>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </div>
  </form>
  );
}
