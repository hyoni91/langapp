//** タイマー延長（5分） */

import { prisma } from "@/lib/prisma";
import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const {sessionId} = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: "Missing session ID" }, { status: 400 });    
    }

    const decoded = await getDecodedSessionOrRedirect();
    if (!decoded) {
      return NextResponse.json({ error : "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({error: "Unauthorized"}, { status: 401 });
    }

    // 요청 바디에서 연장 시간 추출 (기본 5분)
    const { addMinutes } = await req.json().catch(() => ({ addMinutes: 5 }));
    const addMs = Math.max(1, Number(addMinutes || 0)) * 60_000;

    const existing = await prisma.studySession.findFirst({
      where: { id : sessionId, userId: user.id },
      select: { id: true, endedAt: true },
    });

    if (!existing) {
      return  NextResponse.json({error:"Not Found"}, { status: 404 });
    }

    // 기존 종료 시간 기준으로 연장
    const base = existing.endedAt?.getTime() ?? Date.now();
    const nextEndedAt = new Date(base + addMs);

    const update = await prisma.studySession.update({
      where: { id : sessionId },
      data: { endedAt: nextEndedAt },
      select: { endedAt: true },
    });

    // 남은 시간 계산
    const endedAt = update.endedAt ?? nextEndedAt;
    const remainingSec = Math.max(
      0,
      Math.ceil((endedAt.getTime() - Date.now()) / 1000)
    );

    return NextResponse.json(
      {
        endedAt: endedAt.toISOString(),
        remainingSec,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Extend session error:", error);
    return NextResponse.json({error: "Internal Server Error"}, { status: 500 });
  }
}
