/** Quiz 문제용 타입 (듣고 선택하기) */

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {

    try {
    const decoded = await getDecodedSessionOrRedirect();

    if (!decoded) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
        select: { id: true }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 유저의 모든 단어 조회 
    const allWords = await prisma.word.findMany({
        where: { userId: user.id, status: "published" },
        include: { image: true },
    });

    if ( allWords.length < 3 ) {
        return NextResponse.json({ error: "Not enough words for quiz" }, { status: 400 });
    }

    // 랜덤으로 정답 단어 선택 (1개)
    const correctWord = allWords[Math.floor(Math.random() * allWords.length)];

    // 정답을 제외한 오답 단어 선택 (2개)
    const incorrectWords = allWords
        .filter(word => word.id !== correctWord.id)
        .sort(() => 0.5 - Math.random()) // 배열을 랜덤하게 섞기
        .slice(0, 2); // 상위 2개 선택
        
    // 정답과 오답을 섞기
    const options = [correctWord, ...incorrectWords].sort(() => 0.5 - Math.random());

    // 가공 후 반환
    const res = {
        question: {
            id: correctWord.id,
            ko: correctWord.koSurface,
            jp: correctWord.jaSurface,
            lang: correctWord.jaSurface ? "ja" : "ko",
        },
        options: options.map(word => ({
            id: word.id,
            imageUrl: word.image?.imageUrl ?? " ",
        })),
    };

    return NextResponse.json(res, { status: 200 });


    }catch (error) {
        console.error("Error generating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}