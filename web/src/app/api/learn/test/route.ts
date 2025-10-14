/** 테스트 단어 랜덤으로 10개 들고오기*/

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        //user
        const decoded = await getDecodedSessionOrRedirect();
        if(!decoded){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } 

        //학습 완료된 wordId
        const learned = await prisma.studyEvent.findMany({
            where : {
                
                OR : [
                    {action : "learn"},
                    {action : "quiz_end"}
                ],
                userId : decoded.uid
            },
            select: { wordId: true },
        })

        const learnedId = [...new Set(learned.map((e) => e.wordId))];

        //랜덤 추출(Prisma에서는 random order가 안 되므로 JS에서 섞기)
        const shuffled = learnedId.sort(()=> Math.random() - 0.5).slice(0,10);


        //테스트 단어 
        const testWords = await prisma.word.findMany({
            where : {
                userId : decoded.uid,
                status : "published",
                id : { in: shuffled}
            },
            take : 10,
            include : { image:true, tags: true}
        })

        if(testWords.length === 0){
            return NextResponse.json({ message: "No words to test today" });
        }

        return NextResponse.json(testWords)

    } catch(error){
        console.log(error)
        return NextResponse.json({error: "server error"}, {status : 500})
    }
}