// app/(protected)/dashboard/page.tsx
export const runtime = "nodejs";

import { KidButton } from "@/components/ui/KidButton";
import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const decoded = await getDecodedSessionOrRedirect();

  const user = await prisma.user.findUnique({
    where: { firebaseUid: decoded.uid },
    select: { name: true, email: true, createdAt: true },
  });

  const kpi = await getDashboardData(decoded.uid, "ja");

  // 최초 로그인 직후 sync 전에 올 수 있음 → 안전 처리
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-kid-2xl font-hachi">ようこそ 👋</h1>
        <p className="text-kid-lg text-gray-600">
          初期設定を準備しています。数秒後に再読み込みしてください。
        </p>
        <KidButton asChild>
            <Link href="/">홈으로</Link>
        </KidButton>
      </main>
    );
  }

  const createdAtText = user.createdAt
    ? user.createdAt.toLocaleDateString("ja-JP")
    : "-";

  // database에서--->아래 값들은 임시 값. 학습 기록 테이블에서 가져오도록
  const todayWords = 12;
  const todayMinutes = 20;

  const totalWords = 12;
  const totalMinutes = 20;

  return (
     <main className="min-h-screen max-w-md mx-auto px-4 py-10 flex flex-col space-y-8">
      <section aria-labelledby="profile" className="text-center">
        <h1 id="profile" className="text-kid-2xl ">
          ようこそ, {user.name ?? "ユーザー"} さん 👋
        </h1>
        <p className="text-kid-lg text-gray-600">{user.email}</p>
        <p className="text-xs text-gray-400">登録日: {createdAtText}</p>
      </section>

      <section aria-labelledby="today" className="text-center space-y-2">
        <h2 id="today" className="text-kid-xl font-semibold">今日の学習</h2>
        <ul className="text-kid-lg space-y-1">
          <li>今日の単語学習: {kpi.today.wordCount}語</li>
          <li>今日の学習時間: {kpi.today.label}</li>
        </ul>
      </section>

      <section aria-labelledby="total" className="text-center space-y-2">
        <h2 id="total" className="text-kid-xl font-semibold">累計の学習</h2>
        <ul className="text-kid-lg space-y-1">
          <li>総学習時間（当月）: {kpi.monthly.label}</li>
          <li>累計単語学習: {kpi.total.wordCount}語</li>
          <li>累計学習時間: {kpi.total.label}</li>
        </ul>
      </section>

      <section aria-labelledby="alarm" className="text-center space-y-2">
        <h2 id="alarm" className="text-kid-xl font-semibold">アラーム設定</h2>
        <p className="text-kid-lg text-gray-700">学習時間を設定できます。</p>
        <div className="flex items-center justify-center gap-3 text-kid-lg">
          <div className="rounded-kids bg-lemon-100 px-4 py-2 shadow-soft">30分</div>
          <button type="button" className="underline text-brand-600 hover:opacity-80">
            変更
          </button>
        </div>
      </section>

      <section aria-labelledby="actions" className="flex justify-center gap-3 text-kid-lg">
        <KidButton asChild>
          <Link href="/study/words">単語練習を始める</Link>
        </KidButton>
        <KidButton asChild className="bg-gray-800">
          <Link href="/study/sentences">文練習を始める</Link>
        </KidButton>
      </section>
    </main>

  );
}
