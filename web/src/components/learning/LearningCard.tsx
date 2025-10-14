/* eslint-disable @next/next/no-img-element */
"use client"

import { LearnedWord, LearningCardData, LearningListData } from "@/types/lesson";
import { useEffect, useState } from "react";
import { TagFilter } from "../ui/TagFilter";


export default function LearningCard() {
  const [card, setCard] = useState<LearningListData>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);

  // 단어 목록을 태그에 따라 필터링하여 가져오기
   useEffect(() => {
    const fetchWords = async () => {
      try {
        const url = selectedTag
          ? `/api/learn?tag=${encodeURIComponent(selectedTag)}`
          : "/api/learn";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("単語の取得に失敗しました");
        const data = await res.json();
        setCard(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWords();
  }, [selectedTag]); 

  // 발음완료(학습완료) 처리 함수
  const handleLearned = (wordId: string) => {
    const newLearnedWord: LearnedWord = {
      id: wordId,
      learnedAt: new Date(),
      action: "learned",
      lang: "ja",
    };
    setLearnedWords((prev) => [...prev, newLearnedWord]);
    // 필요시 서버에 학습 완료 상태를 전송하는 로직 추가 가능
  }


  return (
    <>      
    <TagFilter onSelect={setSelectedTag} />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {card.map((card:LearningCardData)=>(
      <article 
      key={card.id}
      className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition"
      >
        <div className="relative aspect-[4/3] mb-3 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={card.imgUrl}
            alt={`${card.ja} / ${card.ko}`}
            className="object-cover"
          />
        </div>
        {/* 텍스트 (LearningCard 기본 구조 유지) */}
        <h2 className="text-lg font-semibold">
          {card.ja} <span className="text-gray-500">/ {card.ko}</span>
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <span key={t} className="text-xs rounded-full border px-2 py-1">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3">
          <span
            className={`text-xs px-2 py-1 rounded ${
              card.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {card.status}
          </span>
        </div>
        {/** 발음완료 버튼 */}
        <div className="mt-4 flex gap-2">
          <button 
            type="button"
            onClick={() => handleLearned(card.id)}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white"
            >
            はつおん
          </button>
        </div>
      </article>
    ))}
    </div>
    </>
  );
}
