"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { auth } from "@/lib/firebaseClient";
import { getRedirectResult } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard"; // 로그인 후 이동 경로

  useEffect(() => {
    const handleRedirect = async () => {
      const result = await getRedirectResult(auth);

      if (!result) {
        console.warn("No redirect result found");
        router.replace("/login");
        return;
      }

      const user = result.user;
      const idToken = await user.getIdToken();

      // 세션 발행
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      // DB sync 
      await fetch("/api/users/sync", {
        method: "POST",
        credentials: "include",
      });

      router.replace(next);
    };

    handleRedirect();
  }, []);

  return <p className="p-6 text-center">ログイン処理中です…</p>;
}
