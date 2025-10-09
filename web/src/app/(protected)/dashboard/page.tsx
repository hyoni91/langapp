/** 대쉬보 */

export const runtime = "nodejs";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDecodedSessionOrRedirect } from "@/lib/authServer";
import { getDashboardData } from "@/lib/dashboard";
import SettingTimer from "@/components/timer/SettingTimer";
import { KidButton } from "@/components/ui/KidButton";

export default async function DashboardPage() {
  const decoded = await getDecodedSessionOrRedirect();

  // ユーザ情報
  const user = await prisma.user.findUnique({
    where: { firebaseUid : decoded.uid },
    select: { name: true, email: true, createdAt: true, id : true },
  });

  if (!user) {
    // 🔹 初期設定前の安全処理
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <h1 className="text-2xl font-hachi">ようこそ 👋</h1>
        <p className="text-gray-600 text-center">
          初期設定を準備しています。<br />
          数秒後に再読み込みしてください。
        </p>
        <KidButton asChild>
          <Link href="/">ホームに戻る</Link>
        </KidButton>
      </main>
    );
  }

  // 🔹 KPI 取得
  const kpi = await getDashboardData(user.id, "ja");
  console.log(kpi);
  const createdAtText = user.createdAt?.toLocaleDateString("ja-JP") ?? "-";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-10">
        {/* 프로필 */}
        <section className="text-center">
          <h1 className="text-3xl font-semibold mb-1">
            ようこそ, {user.name ?? "ユーザー"} さん 👋
          </h1>
          <p className="text-gray-600 text-lg">{user.email}</p>
          <p className="text-sm text-gray-400 mt-1">登録日: {createdAtText}</p>
        </section>

        {/* 학습 요약 카드 2개 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {/* 오늘의 학습 */}
          <div className="bg-blue-50 rounded-3xl shadow p-10">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">今日の学習</h2>
            <p className="text-4xl font-extrabold text-blue-800 mb-2">
              {kpi.today.wordCount} <span className="text-xl font-medium">語</span>
            </p>
            <p className="text-lg text-blue-700">学習時間: {kpi.today.label}</p>
          </div>

          {/* 누적 학습 */}
          <div className="bg-green-50 rounded-3xl shadow p-10">
            <h2 className="text-2xl font-bold text-green-600 mb-4">累計の学習</h2>
            <p className="text-4xl font-extrabold text-green-800 mb-2">
              {kpi.total.wordCount} <span className="text-xl font-medium">語</span>
            </p>
            <p className="text-lg text-green-700">総学習時間: {kpi.total.label}</p>
          </div>
        </section>

        {/* 알람 설정 + 버튼 */}
        <section className="rounded-3xl shadow p-10 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">アラーム設定</h2>
          <div className="flex justify-center mb-8">
            <SettingTimer />
          </div>

          <div className="flex justify-center gap-6">
            <KidButton asChild className="text-lg px-6 py-3">
              <Link href="/study/words">今日の単語を見る</Link>
            </KidButton>
            <KidButton asChild className="bg-gray-800 hover:bg-gray-900 text-lg px-6 py-3">
              <Link href="/study/sentences">単語テストをする</Link>
            </KidButton>
          </div>
        </section>
      </div>
    </main>
  );
}
