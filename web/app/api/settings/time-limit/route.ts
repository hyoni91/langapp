import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { prisma } from "@/lib/prisma";
import z from "zod";

export const runtime = "nodejs";

const Body = z.object({
  minutesPerSession: z.number().min(5).max(120),
});


export async function GET() {

    try{
        const decoded = await getDecodedSessionOrRedirect();
        const user = await prisma.user.findUnique({
            where : { firebaseUid : decoded.uid },
            select : { id: true}
        })
        if(!user) return new Response("no user", { status: 401 });

    const setting = await prisma.timeLimitSetting.findUnique({
        where: { userId: user.id },
    });

    return new Response(JSON.stringify({ minutesPerSession: setting?.minutesPerSession ?? 20 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });

    }catch(error){
        console.log("error : " + error)
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });    }

    
}

export async function PUT(req: Request) {

    try{
    const decoded = await getDecodedSessionOrRedirect();
        const user = await prisma.user.findUnique({
            where : { firebaseUid : decoded.uid },
            select : { id: true}
        })
        if(!user) return new Response("no user", { status: 401 });

    const { minutesPerSession } = Body.parse(await req.json());

    const setting = await prisma.timeLimitSetting.upsert({
        where: { userId: user.id },
        create: { userId: user.id, minutesPerSession },
        update: { minutesPerSession },
        select: { minutesPerSession: true, updatedAt: true },

    });

    return new Response(JSON.stringify(setting), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
} catch(error){
           console.log("error : " + error)
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });    }  
}

