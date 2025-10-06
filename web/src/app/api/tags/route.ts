/** 태그목록 불러오기  */

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import {  NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {

    try{
        const decoded = await getDecodedSessionOrRedirect();
        if(!decoded){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //검색 키워드
        const keyword = req.nextUrl.searchParams.get("q");        

        const tags = await prisma.tag.findMany({
            where :  {
                userId: decoded.uid,
                name: { contains: keyword ?? "" }, // 검색어 있으면 필터링
            },
            orderBy: { createdAt: "asc" },
        })
            return NextResponse.json(tags)
    }catch(error){
            console.log(error)
            return NextResponse.json({error: "error"},{status:500})
    }

    
    
}


