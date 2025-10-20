/* eslint-disable @next/next/no-img-element */
"use client"

import { LearnedWord, LearningCardData, LearningListData } from "@/types/lesson";
import { useEffect, useState } from "react";
import { TagFilter } from "../ui/TagFilter";

export default function LearningCard() {
  const [card, setCard] = useState<LearningListData>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);

  // 단어 카드 불러오기(태그 필터링 포함)
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

  // 순차 TTS 재생 함수 
  const speakTextsSequentially = (items : { word : string; lang : string }[]) => {
    if (items.length === 0) return;
    
    // 현재 재생 중인 음성이 있으면 취소
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(items[0].word);
    utter.lang = items[0].lang;
    utter.rate = 0.5; // 속도 조절 (0.1 ~ 10)
    utter.pitch = 1; // 음높이 조절 (0 ~ 2)

    // 발음이 끝난 후 다음 단어 재생
    utter.onend = () => {
      speakTextsSequentially(items.slice(1));
    };

    window.speechSynthesis.speak(utter);
  }

  // 발음완료(학습완료) 처리 함수
  const handleLearned = (cardItem: LearningCardData) => {

    // TTS 재생용 배열 구성 
    const ttsItems = [
      { word: cardItem.ja, lang: "ja" },
      { word: cardItem.ko, lang: "ko" },
    ];
    speakTextsSequentially(ttsItems);

    if (learnedWords.some(w => w.id === cardItem.id)) return; // 먼저 중복 체크

    const newLearnedWord: LearnedWord = {
      id: cardItem.id,
      action: "learn",
      lang: "ja",
    };
    setLearnedWords((prev) => [...prev, newLearnedWord]);

    // 서버에 학습 이벤트 기록
    fetch('/api/study-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: cardItem.id, action: "learn", lang: "ja" }),
    })
    .then(res => {
      if (!res.ok) throw new Error('学習イベントの記録に失敗しました');
      return res.json();
    })
    .then(data => {
      console.log('学習イベントが記録されました:', data);
    })
    .catch(err => {
      console.error(err);
    });
  };



  return (
    <>
    <TagFilter onSelect={setSelectedTag} />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {card.map((cardItem:LearningCardData)=>(
      <article 
      key={cardItem.id}
      className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition"
      >
        <div className="relative aspect-[4/3] mb-3 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={cardItem.imgUrl}
            alt={`${cardItem.ja} / ${cardItem.ko}`}
            className="object-cover"
          />
        </div>
        {/* 텍스트 (LearningCard 기본 구조 유지) */}
        <h2 className="text-lg font-semibold">
          {cardItem.ja} <span className="text-gray-500">/ {cardItem.ko}</span>
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {cardItem.tags.map((t) => (
            <span key={t} className="text-xs rounded-full border px-2 py-1">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3">
          <span
            className={`text-xs px-2 py-1 rounded ${
              cardItem.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {cardItem.status}
          </span>
        </div>
        {/** 발음완료 버튼 */}
        <div className="mt-4 flex gap-2">
          <button 
            type="button"
            onClick={() => handleLearned(cardItem)}
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
