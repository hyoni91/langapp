/** 모든 태그 목록 불러오 */

import { prisma } from "@/lib/prisma";
import {  NextResponse } from "next/server";


export async function GET() {
    const tags = await prisma.tag.findMany({
        orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(tags)
    
}