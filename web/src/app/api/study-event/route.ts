// 학습 이벤트 기록 

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 발음완료 버튼 클릭시 이벤트 기록(게임 통과하면 단어학습 완료로 바꿀 계획)
export async function POST(request: Request) {
    //유저 정보
    const decoded = await getDecodedSessionOrRedirect();
    if(!decoded){
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    } 

    const {uid} = decoded;

    const user = await prisma.user.findUnique({
    where : {
        firebaseUid : uid
    },
    select : {
        id : true
    }
    });

    if(!user){
        return NextResponse.json({error : "user not found"}, {status:404});
    }

    //요청 바디에서 단어 ID와 액션 타입 추출
    const { wordId, action, lang } = await request.json();

    if (!wordId || !action) {
        return new NextResponse(JSON.stringify({ error: "Missing wordId or action" }), { status: 400 });
    }

    // 중복된 이벤트 방지 (예: 동일한 단어에 대해 동일한 액션이 이미 기록된 경우)
    const existingEvent = await prisma.studyEvent.findFirst({
        where: {
            userId: user.id,
            wordId: wordId,
            action: action,
            lang : lang,
        },
    });

    if (existingEvent) {
        return new NextResponse(JSON.stringify({ message: "Event already recorded" }), { status: 200 });
    }

    // 이벤트 기록  

    try {
        //학습 이벤트 기록
        const studyEvent = await prisma.studyEvent.create({
            data : {
                userId : user.id,
                wordId : wordId,
                action : action, 
                lang : lang, 
            }
        });

        //유효한 액션 타입인지 확인 (학습 완료만 허용)
        if (!["learn", "quiz_end"].includes(action)) {
          return new NextResponse(JSON.stringify({ error: "Invalid action type" }), { status: 400 });
        }

         return new NextResponse(JSON.stringify(studyEvent), { status: 201 });

    } catch (error) {
        console.error("Error recording study event:", error);
        return new NextResponse(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
