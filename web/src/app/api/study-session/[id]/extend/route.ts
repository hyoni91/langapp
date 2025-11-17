//** タイマー延長（5分） */

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request,{ params }: { params: { id: string } }) {
  const { id } = params;

  try {
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

    const { addMinutes } = await req.json().catch(() => ({ addMinutes: 5 }));
    const addMs = Math.max(1, Number(addMinutes || 0)) * 60_000;

    // 기존 세션 찾기
    const existing = await prisma.studySession.findFirst({
      where: { id, userId: user.id },
      select: { id: true, endedAt: true },
    });

    if (!existing) {
      return new Response("Not Found", { status: 404 });
    }

    const base = existing.endedAt?.getTime() ?? Date.now();
    const nextEndedAt = new Date(base + addMs);

    // 연장된 종료시간으로 업데이트
    const update = await prisma.studySession.update({
      where: { id },
      data: { endedAt: nextEndedAt },
      select: { endedAt: true },
    });

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
    console.error("error : ", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
