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

    // ユーザの進行中セッションを取得
    const activeSession = await prisma.studySession.findFirst({
      where: { userId: user.id, endedAt: null },
      select: { id: true },
    });

    if (!activeSession) {
      return NextResponse.json({ error: "No active session found" }, { status: 400 });
    }

    // セッションを終了
    await prisma.studySession.update({
      where: { id: activeSession.id },
      data: { endedAt: new Date() },
    });

    return NextResponse.json({ message: "Session ended successfully" });

   }catch (error) {
       console.error(error);
       return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
   }
    

}