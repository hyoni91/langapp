"use client";
import { auth } from "@/lib/firebaseClient"; // initializeApp/getAuth 한 클라이언트
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/";

  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const idToken = await auth.currentUser?.getIdToken(true);
      await fetch("/api/auth/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      router.replace(next);
    } catch (e) {
      alert("로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-sky-50">
      <h1 className="text-2xl font-bold mb-6">🗣️ Language App</h1>
      <button
        onClick={login}
        disabled={loading}
        className="rounded-lg bg-brand-500 px-5 py-3 text-white"
      >
        {loading ? "로그인 중..." : "Google로 로그인"}
      </button>
    </main>
  );
}
