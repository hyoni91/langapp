//** Session end */
// ユーザー認証、ユーザー情報取得、進行中のセッション確認、セッション終了処理
import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const { sessionId } = await req.json();


    if(!sessionId){
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // ユーザの進行中セッションを取得
    const existing = await prisma.studySession.findFirst({
      where: { id: sessionId, userId: user.id, endedAt: null },
        });

    if (!existing) {
      return NextResponse.json({ error: "No active session found" }, { status: 400 });
    }

    // 실제 경과 시간 계산
    const endedAt = new Date();
    const startedAt = new Date(existing.startedAt);
    const durationSec = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    // 세션 종료 + 실제 시간 반영
    await prisma.studySession.update({
      where: { id: existing.id },
      data: {
        endedAt,
        durationSec,
      },
    });


    return NextResponse.json({ message: "Session ended successfully" });

   }catch (error) {
       console.error(error);
       return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
   }
    

}