"use client";
import { AudioQuizOption, AudioQuizQuestion } from "@/types/lesson";
import { useEffect, useState } from "react";

export default function AudioQuiz() {
  const [optionsWord, setOptionsWord] = useState<AudioQuizOption[]>([]);
  const [correctedWord, setCorrectedWord] = useState<AudioQuizQuestion | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 문제 불러오기
  const fetchQuiz = async () => {
    try {
      const res = await fetch("/api/learn-api/quiz", { cache: "no-store" });
      if (!res.ok) throw new Error("퀴즈 문제를 불러오는데 실패했습니다。");
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

  // 음성 재생 (일→한)
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

  // 선택
  const selectOption = async (id: string) => {
    setSelectedId(id);
    if (!correctedWord) return;
    const correct = id === correctedWord.id;
    setIsCorrect(correct);

    if (correct) {
      await fetch("/api/study-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: correctedWord.id, action: "learn" }),
      });

      await new Promise((resolve)=> setTimeout(resolve,1000));

        fetchQuiz();
        setSelectedId(null);
        setIsCorrect(null);
    }
  };

  return (
    <div className="relative w-full max-w-6xl">
      {correctedWord && (
        <div className="mb-6">
          <p className="text-white text-lg mb-4 text-left drop-shadow-md">
            よく聞いて正しい絵を選んでみよう！<br />
            <span className="text-yellow-800 font-bold">
              問題： {correctedWord.ko} / {correctedWord.jp}
            </span>
          </p>
          <button
            onClick={playAudio}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md cursor-pointer"
          >
            🔈 発音
          </button>
        </div>
      )}

      {/* ✅ 이미지 영역 확장 */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {optionsWord.map((option) => (
          <div
            key={option.id}
            onClick={() => selectOption(option.id)}
            className={`
              rounded-3xl border-4 border-dashed shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105
              ${
                selectedId === option.id
                  ? isCorrect
                    ? "border-green-500 bg-green-100"
                    : "border-red-500 bg-red-100"
                  : "border-white bg-white/80"
              }
            `}
          >
            {/* 🔹 여기 변경됨: aspect-[4/3] */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
              <img
                src={option.imageUrl}
                alt="option"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="mt-4 text-xl font-bold text-center">
          {isCorrect ? (
            <span className="text-green-800">✅ 正解！</span>
          ) : (
            <span className="text-red-700">❌ 残念！</span>
          )}
        </div>
      )}
    </div>
  );
}
