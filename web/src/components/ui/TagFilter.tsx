"use client";
import { useEffect, useState } from "react";

type Props = {
  onSelect: (tag: string | null) => void;
  defaultTag?: string | null;
};

export function TagFilter({ onSelect, defaultTag = null }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(defaultTag);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("failed to fetch");
        const data = await res.json();
        setTags(data.map((t: { name: string }) => t.name));
      } catch (err) {
        console.error(err);
        setTags([]);
      }
    };
    fetchTags();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          setSelected(null);
          onSelect(null);
        }}
        className={`px-3 py-1 rounded-full border ${
          selected === null ? "bg-blue-500 text-white" : "bg-white text-black"
        }`}
      >
        全て
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => {
            setSelected(tag);
            onSelect(tag);
          }}
          className={`px-3 py-1 rounded-full border ${
            selected === tag ? "bg-blue-500 text-white" : "bg-white text-black"
          }`}
        >
          {tag}
        </button>
      ))}

      {tags.length === 0 && (
        <p className="text-gray-500 text-sm mt-2">タグが登録されていません</p>
      )}
    </div>
  );
}
