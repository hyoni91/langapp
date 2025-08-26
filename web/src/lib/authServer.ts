import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebaseAdmin";
import { cache } from "react";

// cache? 같은 요청안에서 같은인자로 불리면 한 번만 실행 후 결과 재사용 -> 중복 DB 요청 방지

export const getDecodedSessionOrRedirect = cache(async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session){
        return redirect("/login");
    }
    try{
        const decoded = await adminAuth.verifySessionCookie(session, true);
        return decoded;
    }catch{
        return redirect("/login");
    }

});