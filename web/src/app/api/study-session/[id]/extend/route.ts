//** タイマー延長（5分） */

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {


    try{
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

    const { addMinutes } = await req.json().catch(() => ({ addMinutes: 5 })); // 기본 5분 연장
    const addMs = Math.max(1, Number(addMinutes || 0)) * 60_000; 

    const existing = await prisma.studySession.findFirst({
        where: { id: params.id, userId: user.id },
        select: { id: true, endedAt: true },
    });

    if (!existing) {
        return new Response("Not Found", { status: 404 });
    }

    const base = existing.endedAt?.getTime() ?? Date.now(); // 기존 종료시간 또는 현재시간
    const nextEndedAt = new Date(base + addMs); // 연장된 종료시간 계산

    const update = await prisma.studySession.update({
        where: { id: params.id }, //sessionId  
        data: { endedAt: nextEndedAt },
        select: { endedAt: true },
    });


    const endedAt = update.endedAt ?? nextEndedAt;
    const remainingSec = Math.max(0, Math.ceil(endedAt.getTime() - Date.now()) / 1000); // 남은 시간(초)

    return new Response(JSON.stringify({ endedAt: endedAt.toISOString(), remainingSec }), { status: 200 });


    }catch(error){
        console.error("error : ", error);
        return new Response("Internal Server Error", { status: 500 });

}

}