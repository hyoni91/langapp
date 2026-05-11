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
    
      <Image
        src="/animals/neko.png"
        alt="ねこ"
        width={120}
        height={120}
        className="absolute bottom-0 right-8 w-32 "
      />
      
    </main>
  );
}
