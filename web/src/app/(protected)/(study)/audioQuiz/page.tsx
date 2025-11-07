//** 音声クイズ（Audio Quiz） */

"use client";

import AudioQuiz from "@/components/learn/AudioQuiz";
import Image from "next/image";
import { useStudySession } from "@/hooks/useStudySession";

export default function AudioQuizPage() {
    useStudySession();



  return (
    <main className="relative min-h-screen bg-[#00bf63] flex flex-col items-center px-6 py-10 overflow-hidden">
    
     {/* 상단 제목 */}
      <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">
        今日のクイズ
      </h1>

      <div className="mt-3">
        <AudioQuiz />
      </div>

      {/* 정글 장식 이미지들  */}
      <Image
        src="/animals/monkeys.png"
        alt="원숭이"
        width={160}
        height={160}
        className="absolute top-8 left-6 opacity-90"
      />
      <Image
        src="/animals/snake.png"
        alt="뱀"
        width={130}
        height={130}
        className="absolute bottom-10 right-10 opacity-90"
      />
      <Image
        src="/animals/pond.png"
        alt="연못"
        width={150}
        height={150}
        className="absolute bottom-0 left-12 opacity-90"
      />
    </main>
  );
}
