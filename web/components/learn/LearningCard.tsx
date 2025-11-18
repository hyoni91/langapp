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
          ? `/api/today?tag=${encodeURIComponent(selectedTag)}`
          : "/api/today";

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

  // TTS 재생 
  const handleSpeak = (cardItem: LearningCardData) => {

    // TTS 재생용 배열 구성 
    const ttsItems = [
      { word: cardItem.ja, lang: "ja" },
      { word: cardItem.ko, lang: "ko" },
    ];
    speakTextsSequentially(ttsItems); 
  };

  // 학습완료 처리 함수 (아직 사용 안함)
  const handleLearned = (cardItem: LearningCardData) => {

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
      {/* 태그 필터 */}
      <div className="mb-6">
        <TagFilter onSelect={setSelectedTag} />
      </div>

      {/* 카드 리스트 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl z-10 cursor-pointer">
        {card.map((cardItem: LearningCardData) => (
          <article
            key={cardItem.id}
            onClick={()=>{handleSpeak(cardItem)}}
            className="
              bg-white rounded-3xl shadow-lg border-4 border-dashed border-yellow-100
              hover:scale-105 transition-transform
              overflow-hidden
            "
          >
            {/* 이미지 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                src={cardItem.imgUrl}
                alt={`${cardItem.ja} / ${cardItem.ko}`}
                className="object-cover w-full h-full"
              />
            </div>

            {/* 텍스트 */}
            <div className="p-4 text-left">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {cardItem.ja}
              </h2>
              <p className="text-lg text-gray-600 mb-3">{cardItem.ko}</p>

              {/* 태그 */}
              <div className="flex flex-wrap justify-start gap-2 mb-3">
                {cardItem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-sky-200 text-sky-700 rounded-full px-3 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* 버튼 */}
              {/* <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => handleSpeak(cardItem)}
                  className="rounded-full bg-blue-400 hover:bg-blue-500 px-4 py-2 text-white shadow"
                >
                  はつおん
                </button>
              </div> */}
            </div>
          </article>
        ))}
      </div>

    </>
  );
}