//timer setting
"use client";

import {useEffect, useState } from "react";

export default function SettingTimer() {
    const [loading, setLoading] = useState(false);
    const [minutes, setMinutes] = useState<number | undefined>(undefined); 
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 컴포넌트 마운트 시 기존 설정 불러오기
    useEffect(()=>{
        (async()=>{
            try{
                const res = await fetch("/api/settings/time-limit");
                if(!res.ok) throw new Error("failed to fetch");
                const j = await res.json();
                setMinutes(j.minutesPerSession ?? 20);
            }catch(e){
                setMinutes(20);
                setError("設定の取得に失敗しました");
                console.error(e);
            }
        })();

    },[])

    // 시간 설정
    async function fetchSetting() {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/settings/time-limit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ minutesPerSession: minutes }),
            });
            if (!res.ok) throw new Error("保存に失敗しました");
            setSuccess("保存しました");
            setMinutes(minutes); // 상태 업데이트
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return(
        <>
            <form>
                <div className="flex items-center space-x-2">
                    <label htmlFor="minutes" className="font-medium"></label>
                    <input
                        type="number"
                        id="minutes"
                        min={5}
                        max={120}
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1"
                    />
                    <span>分 (5〜120分)</span>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {success && <p className="text-green-500 mt-2">{success}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                        e.preventDefault();
                        fetchSetting();
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? "保存中..." : "保存"}
                </button>
            </form>
        </>
    )
}