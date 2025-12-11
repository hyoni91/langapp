"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebaseClient";
import { getRedirectResult } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

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

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      await fetch("/api/users/sync", {
        method: "POST",
        credentials: "include",
      });

      router.replace(next);
    };

    handleRedirect();
  }, []);

  return null;
}
