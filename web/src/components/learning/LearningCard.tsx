/* eslint-disable @next/next/no-img-element */
"use client"

import { LearningCardData, LearningListData } from "@/types/lesson";
import { useEffect, useState } from "react";


export default function LearningCard() {

  const [card, setCard] = useState<LearningListData>([]);

  useEffect(() => {
    let ignore = false;

    const fetchWordList = async () => {
    const res = await fetch("/api/learn",{ cache: "no-store" });
    if (!res.ok) throw new Error("リスト取得失敗！");
    const data = await res.json();
    if (!ignore) setCard(data);
    console.log(data)
   };

    fetchWordList();
    return () => {
     ignore = true;
    };
  }, []);

  return (
    <div>
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
      </article>
    ))}
    </div>
  );
}
