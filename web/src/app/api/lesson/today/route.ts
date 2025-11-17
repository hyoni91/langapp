/** 오늘의 단어 10개 들고오기*/

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { LearningListData } from "@/types/lesson";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    try{
        //user
        const decoded = await getDecodedSessionOrRedirect();
        if(!decoded){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const user = await prisma.user.findUnique({
             where: { firebaseUid : decoded.uid },
             select: { id: true }
        });
        
        if (!user) return NextResponse.json({ message: "no user" }, { status: 401 });

        // tag 정보 url로 받기
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get("tag");

        //학습 완료된 wordId
        const learned = await prisma.studyEvent.findMany({
            where : {
                userId : user.id,
                OR : [
                    {action : "learn"},
                    {action : "quiz_end"}
                ],
            },
            select: { wordId: true },
        })

        const learnedId = [...new Set(learned.map((e) => e.wordId))];


        //오늘의 단어
        const todayWords = await prisma.word.findMany({
            where : {
                userId : user.id,
                status : "published",
                ...(tag ? { tags: { some: { name: tag } } } : {}), // ✅ tag 있을 때만 필터링
                NOT : {id: {in : learnedId}}
            },
            distinct: ["id"], // 혹시라도 중복을 방지
            orderBy : {
                createdAt : "asc"
            },
            take : 10,
            include : { image:true, tags: true}
        })

        if(todayWords.length === 0){
            return NextResponse.json([], { status : 200});
        }


        //가공용 타입으로 전환 
        const dto: LearningListData = todayWords.map((w) => ({
         id: w.id,
         ko: w.koSurface,
         ja: w.jaSurface,
         imgUrl: w.image?.imageUrl ?? "https://via.placeholder.com/300x200?text=No+Image",
         tags: w.tags.map((t) => t.name), // Tag 객체 배열 → string[]
         status: w.status,
         imgId : w.image?.id as string // 이미지 확인용 
         })
        );

        return NextResponse.json(dto);

    } catch(error){
        console.log(error)
        return NextResponse.json({error: "server error"}, {status : 500})
    }
}
