import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers"


export default async function DashboardPage() {

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) {
        // Handle missing session, e.g. throw an error or redirect
        throw new Error("No session cookie found");
    }
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const user = await prisma.user.findUnique({
        where : { firebaseUid : decoded.uid }
    })

    return(
        <div>
            <h1>Dashboard</h1>
            <h3>Welcome back, {user?.name}!</h3>
        </div>
    )
}