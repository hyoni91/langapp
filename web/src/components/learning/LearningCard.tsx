import Image from "next/image";
import { LearningCardData } from "@/types/lesson";

type Props = { card: LearningCardData };

export default function LearningCard({ card }: Props) {
  return (
    <article className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition">

        <div className="relative aspect-[4/3] mb-3 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={card.imgUrl}
            alt={`${card.ja} / ${card.ko}`}
            fill
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
  );
}
