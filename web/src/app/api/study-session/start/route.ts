import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


//** Session start */
// ユーザー認証、ユーザー情報取得、進行中のセッション確認、セッション開始処理
export async function POST(req : NextRequest){

   try{
    const decoded = await getDecodedSessionOrRedirect();
    if(!decoded){
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { uid } = decoded;

    const user = await prisma.user.findUnique({
        where: { firebaseUid : uid },
        select: { id: true }
    });
    if (!user) return NextResponse.json({ error: "no user" }, { status: 401 });

    // 進行中セッションの確認
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