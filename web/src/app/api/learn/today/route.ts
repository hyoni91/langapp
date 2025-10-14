/** 오늘의 단어 10개 들고오기*/

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

        //오늘의 단어
        const todayWords = await prisma.word.findMany({
            where : {
                userId : decoded.uid,
                status : "published",
                NOT : {id: {in : learnedId}}
            },
            orderBy : {
                createdAt : "asc"
            },
            take : 10,
            include : { image:true, tags: true}
        })

        if(todayWords.length === 0){
            return NextResponse.json({ message: "No words to learn today" });
        }

        return NextResponse.json(todayWords)

    } catch(error){
        console.log(error)
        return NextResponse.json({error: "server error"}, {status : 500})
    }
}
