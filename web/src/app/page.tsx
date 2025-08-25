import { KidButton } from "@/components/ui/KidButton";
import { KidCard } from "@/components/ui/KidCard";
import { KidHeader } from "@/components/ui/KidHeader";


export default function Home() {
return (
    <>
      <KidHeader title="오늘은 무엇을 해볼까?" emoji="🌈" />

      <section className="flex-1 px-6 py-6">
        <div className="rounded-blob bg-mint-100 p-4 mb-6">
          <div className="text-kid-lg">안녕, 효니! ✨</div>
          <div className="text-gray-700">오늘의 목표: 단어 10개 + 퀴즈 3문제</div>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <a href="/learn"><KidCard icon="📚" title="단어 학습" desc="카드 뒤집기" /></a>
          <a href="/quiz"><KidCard icon="🧩" title="퀴즈" desc="객관식/빈칸" /></a>
          <a href="/speak"><KidCard icon="🎤" title="말하기" desc="따라 말하기" /></a>
        </div>

        <div className="mt-8 flex gap-3">
          <KidButton>🚀 오늘 시작하기</KidButton>
          <KidButton className="bg-sky-500">🔁 복습하기</KidButton>
        </div>
      </section>
    </>
  );
}