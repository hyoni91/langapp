/** dashboard */

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
    // 初期設定前の安全処理
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

  // KPI 取得
  const kpi = await getDashboardData(user.id, "ja");
  const createdAtText = user.createdAt?.toLocaleDateString("ja-JP") ?? "-";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-10">
        {/* プロフィール */}
        <section className="text-center">
          <h1 className="text-3xl font-semibold mb-1">
            ようこそ, {user.name ?? "ユーザー"} さん 👋
          </h1>
          <p className="text-gray-600 text-lg">{user.email}</p>
          <p className="text-sm text-gray-400 mt-1">登録日: {createdAtText}</p>
        </section>

        {/* 学習要約カード */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {/* 今日の学習 */}
          <div className="bg-blue-50 rounded-3xl shadow p-10">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">今日の学習</h2>
            <p className="text-4xl font-extrabold text-blue-800 mb-2">
              {kpi.today.wordCount} <span className="text-xl font-medium">語</span>
            </p>
            <p className="text-lg text-blue-700">学習時間: {kpi.today.label}</p>
          </div>

          {/* 累計の学習 */}
          <div className="bg-green-50 rounded-3xl shadow p-10">
            <h2 className="text-2xl font-bold text-green-600 mb-4">累計の学習</h2>
            <p className="text-4xl font-extrabold text-green-800 mb-2">
              {kpi.total.wordCount} <span className="text-xl font-medium">語</span>
            </p>
            <p className="text-lg text-green-700">総学習時間: {kpi.total.label}</p>
          </div>
        </section>

        {/* アラーム設定 */}
        <section className="rounded-3xl shadow p-10 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">アラーム設定</h2>
          <div className="flex justify-center mb-8">
            <SettingTimer />
          </div>

          <div className="flex justify-center gap-6">
            <KidButton asChild className="text-lg px-6 py-3">
              <Link href="/lesson">今日の単語を見る</Link>
            </KidButton>
            <KidButton asChild className="bg-gray-800 text-lg px-6 py-3">
              <Link href="/audioQuiz">単語テストをする</Link>
            </KidButton>
          </div>
          {/* <br className="my-8" />
            <KidButton asChild className="bg-yellow-500 text-lg px-6 py-3">
              <Link href="/post">投稿する</Link>
            </KidButton> */}
        </section>
        {/* ポストページへのリンク */}
        <section className="rounded-3xl shadow p-10 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">単語登録</h2>
          <p className="mb-4">自分が撮った写真を登録して世界で一つだけの辞書を作ろう</p>
          <KidButton asChild>
            <Link href="/post">投稿する</Link>
          </KidButton>
        </section>
      </div>
    </main>
  );
}
