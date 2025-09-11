// 대시보드 관련 유틸 함수

import { SessionRow } from "@/types/dashboard";
import { getJstDate, jstMonthStart } from "./time";
import { prisma } from "@/lib/prisma";

// 누적 학습 시간 (초 단위) 계산
function sumSeconds(rows : SessionRow[], now = Date.now()) {

    return rows.reduce((sum, s) => {
        const endTs = s.endedAt ? s.endedAt.getTime() : now;
        // durationSec이 null 또는 undefined 경우만 현재 시간 - 시작 시간으로 계산
        const sec = s.durationSec ?? Math.max(0, Math.floor((endTs - s.startedAt.getTime()) / 1000));
        const sumSec = sum + sec;
        return sumSec;
    }, 0);
}

// "X時間 Y分" 또는 "X시간 Y분" 형식으로 변환
function formatHM(totalSec: number, locale: "ja" | "ko" = "ja"): string {
  const mTotal = Math.floor(totalSec / 60);
  const h = Math.floor(mTotal / 60);
  const m = mTotal % 60;
  return locale === "ja"
    ? (h === 0 ? `${m}分` : `${h}時間 ${m}分`)
    : (h === 0 ? `${m}분` : `${h}시간 ${m}분`);
}

export async function getDashboardData(userId:string) {

    const { start, end } = getJstDate(); // 오늘 0시 ~ 23시59분59초 (UTC)
    const monthStart = jstMonthStart(); // 이번달 1일 0시0분0초 (UTC)


}
