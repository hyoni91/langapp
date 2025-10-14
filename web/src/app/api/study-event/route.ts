// 학습 이벤트 기록 

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";

// 발음완료 버튼 클릭시 이벤트 기록
export async function POST(request: Request) {
    //유저 정보
    const decoded = await getDecodedSessionOrRedirect();
    if(!decoded){
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    } 

    const { uid } = decoded;

    //요청 바디에서 단어 ID와 액션 타입 추출
    const { wordId, action } = await request.json();

    if (!wordId || !action) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }

    try {
        //학습 이벤트 기록
        const studyEvent = await prisma.studyEvent.create({
            
            data : {
                userId : uid,
                wordId : wordId,
                action : action, // "learned"
                lang : "ja", // 기준 언어 고정                
            }
        });

        //유효한 액션 타입인지 확인 (학습 완료만 허용)
        if (!["learn"].includes(action)) {
          return new Response(JSON.stringify({ error: "Invalid action type" }), { status: 400 });
        }
        
         return new Response(JSON.stringify(studyEvent), { status: 201 });

    } catch (error) {
        console.error("Error recording study event:", error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
