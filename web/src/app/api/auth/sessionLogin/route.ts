//세션 쿠키 발급 
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

// 7일
const EXPIRES_IN = 60 * 60 * 24 * 7 * 1000; // Firebase createSessionCookie용(ms)
const COOKIE_MAXAGE = 60 * 60 * 24 * 7;      // next/headers cookies().set용(s)

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "ID token is missing" }, { status: 400 });
  }

  // 1) Firebase 세션쿠키 생성 (서명 포함된 문자열)
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: EXPIRES_IN,
  });

  // 2) httpOnly 쿠키로 저장 (XSS로부터 보호)
  const cookieStore = await cookies(); // 버전에 따라 await 필요
  cookieStore.set({
    name: "session",
    value: sessionCookie,
    httpOnly: true,                              // JS로 접근 불가
    secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
    sameSite: "lax",                             // CSRF 리스크 완화(일반 웹앱은 보통 lax)
    path: "/",                                   // 전체 경로에 쿠키 유효
    maxAge: COOKIE_MAXAGE,                       
  });

  return NextResponse.json({ ok: true });
}
