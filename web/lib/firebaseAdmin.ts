// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// PUBLIC이 아니라 서버용 환경 변수 사용해야 함
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// CLI로 넣은 PRIVATE_KEY는 실제 \n 문자로 들어오므로 replace는 불필요하지만,
// 혹시 UI로 입력한 경우가 대비하여 이 정도만 유지
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const adminAuth = getAuth();
