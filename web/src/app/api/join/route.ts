// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebaseAdmin";

// Prisma는 Edge에서 곤란 → Node 런타임 고정
export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("invalid email"),
  // 클라이언트가 보내는 uid는 신뢰하지 않지만, 토큰 uid와 대조하기 위해 받음
  firebaseUid: z.string().min(1, "firebaseUid is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 1) Body validate
    const body = await req.json();
    const { name, email, firebaseUid } = BodySchema.parse(body);

    // 2) Authorization 헤더에서 Firebase ID 토큰 추출
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    // 3) 토큰 검증
    const decoded = await adminAuth.verifyIdToken(token).catch(() => null);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    // 4) 토큰 uid와 body의 firebaseUid 일치 확인 (스푸핑 방지)
    if (decoded.uid !== firebaseUid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }

    // 5) 멱등성 확보: upsert (firebaseUid는 UNIQUE 여야 함)
    const existing = await prisma.user.findUnique({ where: { firebaseUid } });

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        // 필요하면 동기화할 필드를 여기에 (예: name, email)
        // name, email
      },
      create: { firebaseUid, email, name },
    });

    return NextResponse.json({ user }, { status: existing ? 200 : 201 });
  } catch (e: unknown) {
  // Zod 에러
  if (e instanceof ZodError) {
    return NextResponse.json({ error: "Invalid payload", issues: e.issues }, { status: 400 });
  }

  // Prisma 유니크 충돌 등 매핑
  if (typeof e === "object" && e !== null && "code" in e) {
    const err = e as { code?: string; meta?: { target?: string[] } };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Conflict: already exists", target: err.meta?.target },
        { status: 409 }
      );
    }
  }

  console.error("Error creating user:", e);
  return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
}
}
