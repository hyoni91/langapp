import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// DATABASE user update && insert
// ex. google user -> insert(1번만) , email/password user -> update

export async function POST() {

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if(!session) {
        return NextResponse.json({ error: "no session" }, { status: 401 });
    }

    try{
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { uid, email, name } = decoded;

    const user = await prisma.user.upsert({
        where: { firebaseUid : uid },
        update: { name : name ?? undefined, email : email ?? undefined },
        create: { firebaseUid: uid, email: email ?? "", name: name ?? null },
    });

    return NextResponse.json({user});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

}