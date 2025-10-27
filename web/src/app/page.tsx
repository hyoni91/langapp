// import { KidButton } from "@/components/ui/KidButton";
// import { KidCard } from "@/components/ui/KidCard";
// import { KidHeader } from "@/components/ui/KidHeader";

"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-sky-400 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* 상단 텍스트 */}
      <h1 className="text-3xl md:text-5xl font-bold text-black mt-2">
        世界でたった一つの
      </h1>
      <h2 className="text-2xl md:text-4xl mb-10 text-black">
        辞書を作ろう
      </h2>

      {/* 카드 영역 */}
      <section
        className="
          grid 
          w-full 
          max-w-6xl
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-6 
          px-6
          z-10
        "
      >
        {/* 今日の単語 */}
        <a href="/learn">
          <div
            className="
              bg-purple-500 text-white 
              rounded-3xl border-4 border-dashed border-white 
              flex flex-col justify-center items-center
              py-14 md:py-20 text-3xl font-bold shadow-xl
              hover:scale-105 transition-transform cursor-pointer
            "
          >
            今日の単語
          </div>
        </a>

        {/* クイズ */}
        <a href="/quiz">
          <div
            className="
              bg-yellow-300 text-white 
              rounded-3xl border-4 border-dashed border-white 
              flex flex-col justify-center items-center
              py-14 md:py-20 text-3xl font-bold shadow-xl
              hover:scale-105 transition-transform cursor-pointer
            "
          >
            クイズ
          </div>
        </a>

        {/* ダッシュボード */}
        <a href="/dashboard">
          <div
            className="
              bg-red-500 text-white 
              rounded-3xl border-4 border-dashed border-white 
              flex flex-col justify-center items-center
              py-14 md:py-20 text-3xl font-bold shadow-xl
              hover:scale-105 transition-transform cursor-pointer
            "
          >
            ダッシュボード
          </div>
        </a>
      </section>

      {/* 동물 이미지들 */}
      <Image
        src="/animals/giraffe.png"
        alt="기린"
        width={160}
        height={160}
        className="absolute bottom-0 left-4 sm:left-10"
      />
      <Image
        src="/animals/lion.png"
        alt="사자"
        width={180}
        height={180}
        className="absolute top-20 right-4 sm:right-12"
      />
    </main>
  );
}
