import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

//** Session start */
// ユーザー認証、ユーザー情報取得、進行中のセッション確認、セッション開始処理
export async function POST(req: NextRequest) {
  try {
    const decoded = await getDecodedSessionOrRedirect();
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { uid } = decoded;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "no user" }, { status: 401 });

    // 進行中セッションの確認
    const active = await prisma.studySession.findFirst({
      where: {
        userId: user.id,
        endedAt: null,
        startedAt: { gte: subDays(new Date(), 1) }, // 하루 이내 세션만 active 취급
      },
      select: { id: true, startedAt: true, durationSec: true },
    });

    // 유저별 기본 시간 설정 가져오기
    const setting = await prisma.timeLimitSetting.findUnique({
      where: { userId: user.id },
    });

    const minutes = setting?.minutesPerSession ?? 20;
    const durationSec = minutes * 60; // 초 단위
    const durationMs = durationSec * 1000; // 밀리초 단위

    // 세션이 이미 있으면 그거 사용, 없으면 새로 생성
    const base = active
      ? { 
          id: active.id,
          startedAt: active.startedAt,
          durationSec: active.durationSec ?? durationSec, // 기존 세션에 없을 때 대비
        }
      : await prisma.studySession.create({
          data: {
            userId: user.id,
            startedAt: new Date(),
            durationSec,
          },
          select: { id: true, startedAt: true, durationSec: true },
        });

    // 종료 예정 시각 계산
    const willEndAt = new Date(base.startedAt.getTime() + (base.durationSec ?? durationSec) * 1000);

    return NextResponse.json({
      sessionId: base.id,
      startedAt: base.startedAt.toISOString(),
      willEndAt: willEndAt.toISOString(),
      durationSec: base.durationSec, // 서버에서 클라이언트로 보내줄 값
      reason: active ? "resume" : "auto_start",
    });

  } catch (error) {
    console.error("Session start error:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
