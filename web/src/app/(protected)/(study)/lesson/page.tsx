//** 今日の単語（Vocabulary of the Day）*/

"use client";

import LearningCard from "@/components/learn/LearningCard";
import { useStudySession } from "@/hooks/useStudySession";
import Image from "next/image";



export default function LessonsPage() {
   useStudySession();

  return (
    <main className="relative min-h-screen bg-orange-200 flex flex-col items-center px-6 py-10 overflow-hidden"
>
       {/* 상단 제목 */}
      <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">
        今日の単語 
      </h1>

      <div className="mt-3">
        <LearningCard />
      </div>
    {/** 바다 이미지들 */}
      {/* 🐙 문어 이미지 */}
      <Image
        src="/animals/octopus.png"
        alt="문어"
        width={150}
        height={150}
        className="absolute top-10 right-8 opacity-90"
      />
      {/* 🦀 게 */}
      <Image
        src="/animals/crab.png"
        alt="게"
        width={100}
        height={100}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-90"
      />
      {/* 🌿 해초 */}
      <Image
        src="/animals/seaweed-left.png"
        alt="해초"
        width={120}
        height={120}
        className="absolute bottom-0 left-8"
      />
      <Image
        src="/animals/seaweed-right.png"
        alt="해초"
        width={120}
        height={120}
        className="absolute bottom-0 right-8"
      />
      
    </main>
  );
}
