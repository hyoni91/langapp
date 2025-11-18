// web/middleware.ts（프로젝트 루트에 src가 있어도 middleware는 루트 기준）
// 미들웨어: 비로그인 사용자는 /login으로

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
    "/",
  "/login",
  "/api/auth/sessionLogin",
  "/api/auth/sessionLogout",
  "/_next",
  "/favicon",
  "/assets",
];

export function middleware(req: NextRequest) {
    if(PUBLIC_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next(); 
    }

    const isProtected =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/learn") ||
    req.nextUrl.pathname.startsWith("/quiz") ||
    req.nextUrl.pathname.startsWith("/stats") ||
    req.nextUrl.pathname.startsWith("/profile");

    if(!isProtected) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const hasSession = req.cookies.get("session")?.value;
    if(!hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        if (req.nextUrl.pathname !== "/") url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(url);

    }

}