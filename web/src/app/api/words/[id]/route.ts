import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest, {params}:{params : {id : string}}) {
    const { jaSurface, koSurface, status, imageUrl, storagePath, contentType } = await req.json();

    //user
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

    // image저장
    const image = await prisma.image.create({
        data : {
            userId : user.id,
            imageUrl,
            storagePath : storagePath,
            contentType : contentType

        }
    });

    // status 자동 결정: 두 언어가 다 채워져 있으면 published, 아니면 draft
    const finalStatus = status ?? (jaSurface&&koSurface ? "published" : "draft");


    let word;
    if (params.id === "new") {
        // 새로 생성
        word = await prisma.word.create({
        data: {
            userId: user.id,
            jaSurface: jaSurface ?? "",
            koSurface: koSurface ?? "",
            imageId : image.id,
            status : finalStatus,            
        },
        include: { image: true },

        });
    } else {
        // 기존 단어 수정
        try {
        word = await prisma.word.update({
            where: { id: params.id, userId: user.id },
            data: { 
                jaSurface : jaSurface ?? "", 
                koSurface : koSurface ?? "",
                status : finalStatus,
                ...(image?.id ? { imageId : image.id } : {}),
            },
            include: { image: true },
        });
        } catch {
        return NextResponse.json({ error: "word not found" }, { status: 404 });
        }
    }

    return NextResponse.json(word);

}