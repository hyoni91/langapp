import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest, {params}:{params : {id : string}}) {
    const { jaSurface, koSurface, status } = await req.json();
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if(!session) {
        return NextResponse.json({ error: "no session" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { uid } = decoded;

    

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


    let word;
    if (params.id === "new") {
        // 새로 생성
        word = await prisma.word.create({
        data: {
            userId: user.id,
            jaSurface,
            koSurface,
            status,
        },
        });
    } else {
        // 기존 단어 수정
        try {
        word = await prisma.word.update({
            where: { id: params.id, userId: user.id },
            data: { jaSurface, koSurface, status },
        });
        } catch {
        return NextResponse.json({ error: "word not found" }, { status: 404 });
        }
    }

    return NextResponse.json(word);

}