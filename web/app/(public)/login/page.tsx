"use client";

export const dynamic = "force-dynamic";


import { signUpWithGoogle } from "@/lib/authClient";
import { auth } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const sp = useSearchParams(); 
  const router = useRouter();
  const next = sp.get("next") || "/dashboard"; // デフォルト遷移先

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  //session 発行
  const issueSession = async () => {
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) throw new Error("ID token not found");
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Set-Cookie 
      body: JSON.stringify({ idToken }),
    });

    await fetch("/api/users/sync", {
    method: "POST",
    credentials: "include",
  });
  
    if (!res.ok) {
      throw new Error("Failed to issue session.");
    }
  };

  const loginWithGoogle = async () => {
  setLoading(true);
  setErr(null);

  try {
    const googleUser = await signUpWithGoogle();

    // 토큰이 여기서 바로 있지!
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken: googleUser.token }),
    });

    router.replace(next);

  } catch (e) {
    console.error(e);
    setErr("Googleログインに失敗しました。");
  } finally {
    setLoading(false);
  }
};



  const loginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      await issueSession();
      router.replace(next);
    } catch (e: unknown) {
      console.error(e);
      // Firebase Auth エラーコードに基づくメッセージ
      const code = (e as { code?: string })?.code || "";
      const msg =
        code === "auth/invalid-credential"
          ? "メールまたはパスワードが正しくありません。"
          : code === "auth/too-many-requests"
          ? "試行回数が多すぎます。しばらくしてからお試しください。"
          : "ログインに失敗しました。もう一度お試しください。";
      setErr(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-sky-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold mb-4">🗣️ Language App</h1>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full rounded-lg bg-black text-white px-4 py-2 mb-4"
        >
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>

        <div className="my-3 text-center text-xs text-gray-500">または</div>

        {/* Email / Password */}
        <form onSubmit={loginWithEmail} className="grid gap-3">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded border px-3 py-2"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 text-white px-4 py-2"
          >
            {loading ? "ログイン中..." : "メールでログイン"}
          </button>
        </form>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <p className="mt-4 text-center text-sm text-gray-600">
          アカウント未作成？{" "}
          <a href="/register" className="text-brand-600 underline">
            新規登録
          </a>
        </p>
      </div>
    </main>
  );
}
