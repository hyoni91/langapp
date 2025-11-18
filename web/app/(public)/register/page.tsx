"use client";

import { signUpWithEmail } from "@/lib/authClient";
import { RegisterForm } from "@/types/auth";
import { useState } from "react";
import { auth } from "@/lib/firebaseClient"; 
import type { FirebaseError } from "firebase/app";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({ email: "", password: "", name: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); //提出状態

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.email || !form.password || !form.name) {
      setMsg("すべてのフィールドを入力してください。");
      return;
    }
    if (form.password.length < 6) {
      setMsg("パスワードは6文字以上である必要があります。");
      return;
    }

    setMsg(null);
    setSubmitting(true);

    try {
      const {uid, token} = await signUpWithEmail(form.email, form.password);

      const current = auth.currentUser;
      if (!current) throw new Error("ユーザー登録に失敗しました。");

      const response = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          firebaseUid: uid,
        }),
      });
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        setMsg(data?.error ? `Join 失敗: ${data.error}` : "Join 失敗: アル未知のエラー");
        return;
      }

      setMsg("会員登録が完了しました。 🎉");
      // 必要に応じてページ移動
      // router.push("/dashboard");

    } catch (err: unknown) {
      // Firebase エラーメッセージ処理
      const m =
        (err as FirebaseError)?.code // Firebase Auth エラーコード
          ? `会員登録失敗 (${(err as FirebaseError).code})`
          : (err as Error)?.message
          ? `会員登録失敗: ${(err as Error).message}`
          : "会員登録中にエラーが発生しました。";
      setMsg(m);
      console.error("Registration error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow p-10 space-y-8">
        <h1 className="text-center text-3xl font-bold text-blue-700">
          アカウント登録
        </h1>
        <p className="text-center text-gray-500">
          メール・パスワード・名前を入力してください
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-lg font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value.trim() })
              }
              required
              autoComplete="email"
              disabled={submitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base sm:text-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-lg font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
              disabled={submitting}
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base sm:text-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="6文字以上で入力"
            />
          </div>

          {/* 名前 */}
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-lg font-medium text-gray-700"
            >
              名前
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={submitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base sm:text-lg
                         focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="例：ひょに"
            />
          </div>

          {/* ボタン */}
          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? "登録中..." : "登録"}
            </button>
          </div>
        </form>

        {/* メッセージ */}
        {msg && (
          <p
            className={`text-center text-sm font-medium ${
              msg.includes("完了") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
