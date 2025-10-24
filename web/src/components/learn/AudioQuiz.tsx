"use client";

import { AudioQuizOption, AudioQuizQuestion } from "@/types/lesson";
import { useEffect, useState } from "react";

export default function AudioQuiz() {
  const [optionsWord, setOptionsWord] = useState<AudioQuizOption[]>([]);
  const [correctedWord, setCorrectedWord] = useState<AudioQuizQuestion | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const fetchQuiz = async () => {
      try {
        const res = await fetch("/api/learn/quiz", { cache: "no-store" });
        if (!res.ok) throw new Error("퀴즈 문제를 불러오는데 실패했습니다.");
        const data = await res.json();
        setCorrectedWord(data.question);
        setOptionsWord(data.options);
      } catch (err) {
        console.error(err);
      }
    };

  useEffect(() => {
    fetchQuiz();
  }, []);

  // TTS 재생 함수 (한국어 → 일본어 순차)
  const playAudio = () => {
    if (!correctedWord) return;
    window.speechSynthesis.cancel();

    const koUtter = new SpeechSynthesisUtterance(correctedWord.ko);
    koUtter.lang = "ko-KR";
    koUtter.rate = 0.5;

    const jpUtter = new SpeechSynthesisUtterance(correctedWord.jp);
    jpUtter.lang = "ja-JP";
    jpUtter.rate = 0.5;

    koUtter.onend = () => {
      window.speechSynthesis.speak(jpUtter);
    };

    window.speechSynthesis.speak(koUtter);
  };

  // 정답 선택 함수
  const selectOption = async (id: string) => {
    setSelectedId(id);
    if (!correctedWord) return;
    const correct = id === correctedWord.id;
    setIsCorrect(correct);

    if(correct){
      await fetch("/api/study-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: correctedWord.id,
          action: "learn",
        }),
      });

      setTimeout(() => {
        // 다음 문제로 이동
        fetchQuiz();
        setSelectedId(null);
        setIsCorrect(null);
      }, 1000);
    }
    
  };

  return (
    <div>
      {correctedWord && (
        <div>
          <h2>{correctedWord.jp} / {correctedWord.ko}</h2>
          <button onClick={playAudio} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            🔊 発音
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4">
        {optionsWord.map((option) => (
          <div
            key={option.id}
            onClick={() => selectOption(option.id)}
            className={`border p-2 rounded cursor-pointer ${
              selectedId === option.id
                ? isCorrect
                  ? "border-green-500"
                  : "border-red-500"
                : ""
            }`}
          >
            <img src={option.imageUrl} alt="option" className="w-full h-40 object-cover" />
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="mt-2">
          {isCorrect ? "✅ 正解!" : "❌ 残念!"}
        </div>
      )}

    </div>
  );
}
