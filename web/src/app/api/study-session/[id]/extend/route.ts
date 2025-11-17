//** タイマー延長（5分） */

import { prisma } from "@/lib/prisma";
import { getDecodedSessionOrRedirect } from "@/lib/authServer";

// Next.js 빌드에서 타입 검사를 피하기 위한 선언
export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, ..._args: any[]) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").at(-2); // ← "/extend" 앞의 id 부분 추출

    if (!id) {
      return new Response("Missing session ID", { status: 400 });
    }

    const decoded = await getDecodedSessionOrRedirect();
    if (!decoded) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 요청 바디에서 연장 시간 추출 (기본 5분)
    const { addMinutes } = await req.json().catch(() => ({ addMinutes: 5 }));
    const addMs = Math.max(1, Number(addMinutes || 0)) * 60_000;

    const existing = await prisma.studySession.findFirst({
      where: { id, userId: user.id },
      select: { id: true, endedAt: true },
    });

    if (!existing) {
      return new Response("Not Found", { status: 404 });
    }

    // 기존 종료 시간 기준으로 연장
    const base = existing.endedAt?.getTime() ?? Date.now();
    const nextEndedAt = new Date(base + addMs);

    const update = await prisma.studySession.update({
      where: { id },
      data: { endedAt: nextEndedAt },
      select: { endedAt: true },
    });

    // 남은 시간 계산
    const endedAt = update.endedAt ?? nextEndedAt;
    const remainingSec = Math.max(
      0,
      Math.ceil((endedAt.getTime() - Date.now()) / 1000)
    );

    return new Response(
      JSON.stringify({
        endedAt: endedAt.toISOString(),
        remainingSec,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Extend session error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
