"use client";

import { signUpWithEmail, getUserToken } from "@/lib/authClient";
import { RegisterForm } from "@/types/auth";
import { useState } from "react";
import { auth } from "@/lib/firebaseClient"; 
import type { FirebaseError } from "firebase/app";
// (선택) next/navigation으로 회원가입 후 이동하고 싶다면
// import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({ email: "", password: "", name: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); // 제출 중 상태
  // const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.email || !form.password || !form.name) {
      setMsg("모든 항목을 입력해주세요.");
      return;
    }
    if (form.password.length < 6) {
      setMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setMsg(null);
    setSubmitting(true);

    try {
      const {uid, token} = await signUpWithEmail(form.email, form.password);

      const current = auth.currentUser;
      if (!current) throw new Error("회원 가입 직후 사용자 세션이 설정되지 않았습니다.");

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
        setMsg(data?.error ? `Join 실패: ${data.error}` : "Join 실패: 알 수 없는 오류");
        return;
      }

      setMsg("회원가입이 완료되었습니다. 🎉");
      // 필요시 페이지 이동
      // router.push("/dashboard");

    } catch (err: unknown) {
      // Firebase 단계/토큰 단계/서버 단계 등에서 발생 가능
      const m =
        (err as FirebaseError)?.code // Firebase Auth 에러 코드
          ? `회원가입 실패 (${(err as FirebaseError).code})`
          : (err as Error)?.message
          ? `회원가입 실패: ${(err as Error).message}`
          : "회원가입 중 오류가 발생했습니다.";
      setMsg(m);
      console.error("Registration error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
            required
            autoComplete="email"
            disabled={submitting}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
            disabled={submitting}
            minLength={6}
          />
        </div>

        <div>
          <label>Name:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={submitting}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </>
  );
}
