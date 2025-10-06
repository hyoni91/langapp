/** Tag필터링UI */

"use client";

import { useEffect, useState } from "react";

type Props = {
  onSelect: (tag: string | null) => void;
  defaultTag?: string | null;
};

export function TagFilter({onSelect,defaultTag=null}:Props){
    const [tags, setTags] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(defaultTag);

    useEffect(()=>{
        fetch("/api/tags")
        .then((res)=> res.json())
        .then((data)=> setTags(data.map((t: { name: string }) => t.name)));
    },[])


    return(
       <div className="flex flex-wrap gap-2">
      {/* <button
        onClick={() => {
          setSelected(null);
          onSelect(null);
        }}
        className={`px-3 py-1 rounded-full border ${
          selected === null ? "bg-blue-500 text-white" : "bg-white"
        }`}
      >
        全て
      </button> */}

      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => {
            setSelected(tag);
            onSelect(tag);
          }}
          className={`px-3 py-1 rounded-full border ${
            selected === tag ? "bg-blue-500 text-white" : "bg-black"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}