/** 모든 태그 목록 불러오 */

import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import {  NextResponse } from "next/server";


export async function GET() {

    try{
        const decoded = await getDecodedSessionOrRedirect();
        if(!decoded){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


    const tags = await prisma.tag.findMany({
        where :  {userId: decoded.id},
        orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(tags)
    }catch(error){
        console.log(error)
        return NextResponse.json({error: "error"},{status:500})
    }

    
    
}


