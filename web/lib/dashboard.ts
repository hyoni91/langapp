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
        // const sec = Math.max(0, Math.floor((endTs - s.startedAt.getTime()) / 1000));

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



// 대시보드 데이터 조회 후 가공 (간단판: 오늘 시작한 세션만 집계)
export async function getDashboardData(userId: string, locale: "ja" | "ko" = "ja") {
  const { start, end } = getJstDate();   // JST 오늘 00:00 ~ 23:59:59 (UTC)
  const monthStart = jstMonthStart();    // JST 이번달 1일 00:00 (UTC)

  // 쿼리: 세션/이벤트 최소필드만 가져오기
  const [
    todaySessions,
    monthSessions,
    allSessions,
    todayWordsDistinct,
    totalWordsDistinct,
  ] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, startedAt: { gte: start, lte: end } }, // 오늘 시작한 세션(todaySessions)
      select: { startedAt: true, endedAt: true, durationSec: true },
    }),
    prisma.studySession.findMany({
      where: { userId, startedAt: { gte: monthStart } },      // 이번달 시작한 세션(monthSessions)
      select: { startedAt: true, endedAt: true, durationSec: true },
    }),
    prisma.studySession.findMany({
      where: { userId },                                      // 누적 전체(allSessions)
      select: { startedAt: true, endedAt: true, durationSec: true },
    }),
    prisma.studyEvent.findMany({
      where: { userId, createdAt: { gte: start, lte: end }, action: { in: ["learn", "quiz_end"] }, }, // 오늘 이벤트(todayEvents)
      distinct: ["wordId"],
      select: { wordId: true },
    }),
    prisma.studyEvent.findMany({
      where: { userId,  action: { in: ["learn", "quiz_end"] }, },                                      // 누적 이벤트(allEvents)
      distinct: ["wordId"],
      select: { wordId: true },
    }),
  ]);

  // 합계(초)
  const secToday = sumSeconds(todaySessions);
  const secMonth = sumSeconds(monthSessions);
  const secTotal = sumSeconds(allSessions);

  return {
    today: {
      seconds: secToday,
      minutes: Math.floor(secToday / 60),
      label: formatHM(secToday, locale),                 // "X時間 Y分" / "X시간 Y분"
      wordCount: todayWordsDistinct.length,              // 오늘 유니크 단어 수
    },
    monthly: {
      seconds: secMonth,
      minutes: Math.floor(secMonth / 60),
      label: formatHM(secMonth, locale),
    },
    total: {
      seconds: secTotal,
      minutes: Math.floor(secTotal / 60),
      label: formatHM(secTotal, locale),
      wordCount: totalWordsDistinct.length,              // 누적 유니크 단어 수
    },
  };
}
