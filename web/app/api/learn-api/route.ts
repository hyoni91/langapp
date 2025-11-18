/** 보존중인 단어 리스트 모두 불러오기 */

import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { LearningListData } from "@/types/lesson";
import { cookies } from "next/headers";
import {NextResponse } from "next/server";

export async function GET(request: Request) {

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    // tag 정보 url로 받기
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    if(!session) {
       return NextResponse.json({ message: "no session" }, { status: 401 });
    }

    try{
        //유저 정보 
        const decoded = await adminAuth.verifySessionCookie(session, true);
        const { uid } = decoded;

        const user = await prisma.user.findUnique({
        where: { firebaseUid : uid }
        });
        
        if (!user) return NextResponse.json({ message: "no user" }, { status: 401 });

        //유저의 단어장 리스트 전부 
        const wordList = await prisma.word.findMany({
        where : {
            userId : user.id,
            ...(tag ? { tags: { some: { name: tag } } } : {}), // ✅ tag 있을 때만 필터링
        },
        distinct: ["id"], // 혹시라도 중복을 방지
        orderBy : {createdAt : "asc"},
        include : { image:true, tags:true}
        })

        //배열 반환 예정이므로 길이로 비교
        if(wordList.length === 0){ return NextResponse.json({message : "単語が存在しません"}, { status : 404}) }

        //가공용 타입으로 전환 
        const dto: LearningListData = wordList.map((w) => ({
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
        return NextResponse.json(
            {message : "サーバーエラーが発生しました。"},
            {status: 500}
        );
    }
    
}