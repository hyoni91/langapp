import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";





// 자동 시작 API
// 1. 유저 인증 2. 유저 정보 가져오기 3. 진행 중 세션이 있으면 이어서, 없으면 새로 시작
// 4. 세션 제한 시간 가져오기 (없으면 기본 20분) 5. 응답으로 세션 정보 반환
export async function POST(req : NextRequest){
   const cookieStore = await cookies();
   const session = cookieStore.get("session")?.value;
   if(!session) {
       return NextResponse.json({ error: "no session" }, { status: 401 });
   }

   try{
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { uid } = decoded;

    const user = await prisma.user.findUnique({
        where: { firebaseUid : uid }
    });
    if (!user) return NextResponse.json({ error: "no user" }, { status: 401 });

    // 진행 중 세션이 있으면 이어서
  const active = await prisma.studySession.findFirst({
    where: { userId: user.id, endedAt: null },
    select: { id: true, startedAt: true },
  });

  const setting = await prisma.timeLimitSetting.findUnique({
    where: { userId: user.id },
  });

  const minutes = setting?.minutesPerSession ?? 20;

  const base = active ? { id: active.id, startedAt: active.startedAt }
    : await prisma.studySession.create({
        data: { userId: user.id, startedAt: new Date() },
        select: { id: true, startedAt: true },
      });

   const willEndAt = new Date(new Date(base.startedAt).getTime() + minutes * 60_000);

   return NextResponse.json({
    sessionId: base.id,
    startedAt: base.startedAt.toISOString(),
    willEndAt: willEndAt.toISOString(),
    limitMinutes: minutes,
    reason: active ? "resume" : "auto_start",
  });

   }catch (error) {
       console.error(error);
       return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
   }
    

}