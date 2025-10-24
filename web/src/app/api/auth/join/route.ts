// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("invalid email"),
  firebaseUid: z.string().min(1, "firebaseUid is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, firebaseUid } = BodySchema.parse(body);

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token).catch(() => null);
    if (!decoded) return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });

    // UID 스푸핑 방지 
    if (decoded.uid !== firebaseUid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }


    // 1) 최초 등록 시도
    const created = await prisma.user.create({
      data: { firebaseUid, email, name },
    });

    return NextResponse.json({ user: created }, { status: 201 });

  } catch (e: unknown) {
    // 중복(이미 존재) → 기존 리소스 반환하고 200으로
    if ((e as { code?: string }).code === "P2002") {
      const { firebaseUid } = await req.json().catch(() => ({ firebaseUid: undefined }));
      if (firebaseUid) {
        const existing = await prisma.user.findUnique({ where: { firebaseUid } });
        if (existing) return NextResponse.json({ user: existing }, { status: 200 });
      }
      return NextResponse.json({ error: "Conflict: already exists" }, { status: 409 });
    }

    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.issues }, { status: 400 });
    }

    console.error("Error creating user:", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
