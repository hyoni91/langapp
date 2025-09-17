import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import z from "zod";

export const runtime = "nodejs";

const Body = z.object({
  minutesPerSession: z.number().min(5).max(120),
});

async function getUser(){
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if(!session) throw new Error("no session");

    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { uid } = decoded;
    
    const user = await prisma.user.findUnique({
        where: { firebaseUid : uid }
    });
    if (!user) throw new Error("no user");
    return user;
}

export async function GET() {
    const user = await getUser();
    if(!user) return new Response("no user", { status: 401 });

    const setting = await prisma.timeLimitSetting.findUnique({
        where: { userId: user.id },
    });
    return new Response(JSON.stringify({ minutesPerSession: setting?.minutesPerSession ?? 20 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export async function PUT(req: Request) {
    const user = await getUser();
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

}