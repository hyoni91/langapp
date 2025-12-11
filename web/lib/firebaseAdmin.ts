// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// 이미 초기화된 앱이 있으면 재사용

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");


if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      // 환경변수의 개행문자를 복원해줘야 함
      privateKey
    }),
  });
}

export const adminAuth = getAuth();
