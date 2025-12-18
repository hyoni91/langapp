/* eslint-disable @next/next/no-img-element */
"use client"

import { Tags, WordForm } from "@/types/word";
import { useCallback, useEffect, useRef, useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

type props ={
    wordId : string;
}

export default function WordEditor({wordId}:props){


  //React의 Hook(useState, useEffect 등)은 컴포넌트 최상위에서만 호출 가능
    const {uid} = useUser();
    const [allTags, setAllTags] = useState<Tags[]>([]);
    const [isComposing, setIsComposing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);



    const [form, setForm] = useState<WordForm>({
        jaSurface: "",
        koSurface: "",
        imageFile: null,
        preview:null,
        tags : [] as string[]
    })

    //태그 목록
    const fetchTags = async () => {
        try {
          const res = await fetch("/api/tags");
          if (!res.ok) throw new Error("タグ取得失敗");
          const data = await res.json();
          setAllTags(data);
        } catch (e) {
          console.error("タグ取得エラー:", e);
        }
      };

    useEffect(()=>{
      fetchTags();
    },[])

    // 태그 선택 토글
    const toggleTag = useCallback((tagName: string) => { //useCallback을 사용해서 불필요한 재랜더링방지
      setForm((prev) => {
        const already = prev.tags.includes(tagName);
        return {
          ...prev,
          tags: already //현재 선택한 태그가 이미 있는 대그야? 
            ? prev.tags.filter((t) => t !== tagName) // 태그이름 같아? 그럼 빼!
            : [...prev.tags, tagName], // 아니면 남겨
        };
      });

    }, []);



    const addNewTag = (value: string) => {
      console.log("▶ addNewTagMobile value:", value);
      console.log("▶ before:", form.tags);
      value = value.trim();
      if (value && !form.tags.includes(value)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, value] }));
      }

    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || isComposing) return;
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      addNewTag(value);
      e.currentTarget.value = "";
    };


    const handleChange = (key: "jaSurface" | "koSurface", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    };

    //파일 선택
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      preview: URL.createObjectURL(file), // 미리보기
    }));
  };

    //저장
    const handleSave = async()=>{
        if(!form.imageFile){
            alert("画像を選択してください。");
            return;
        }
        // 1-1. Firebase Storage 업로드
        // 🔑 uid 기반 저장 경로
        const storagePath = `user_uploads/${uid}/${form.imageFile.name}-${Date.now()}`;
        const storageRef = ref(storage, storagePath);


        await uploadBytes (storageRef, form.imageFile, {
            contentType : form.imageFile.type,
        })

        //1-2. download url 얻기
        const imageUrl = await getDownloadURL(storageRef);

        console.log("✅ 업로드 성공:", { storagePath, imageUrl });


        // 2. API 호출
        const res = await fetch(`/api/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jaSurface: form.jaSurface,
            koSurface: form.koSurface,
            imageUrl,
            storagePath,
            contentType : form.imageFile.type,
            tags: form.tags,
            id : wordId
        }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("保存失敗:", err);
          alert("保存できませんでした。");
          return;
        }


        const data = await res.json();
        console.log("保存成功:", data);
        alert("保存しました！");

        setForm({
        jaSurface: "",
        koSurface: "",
        imageFile: null,
        preview:null,
        tags : [] as string[] 
        })

        //새 태그 목록 갱신
        await fetchTags();
    }



    return(
    <div className="max-w-md mt-16 mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      {/* 사진 업로드 / 촬영 */}
        <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
            写真をアップロード / 撮影
        </label>
        <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />

        {/* 미리보기 */}
        {form.preview && (
            <div className="mt-3">
            <img
                src={form.preview}
                alt="preview"
                className="rounded-lg border object-cover w-48 h-32"
            />
            </div>
        )}
        </div>

      {/* 일본어 입력 */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          日本語
        </label>
        <input
          type="text"
          value={form.jaSurface}
          onChange={(e)=>handleChange("jaSurface", e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="日本語を入力"
        />
      </div>

      {/* 한국어 입력 */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          韓国語
        </label>
        <input
          type="text"
          value={form.koSurface}
          onChange={(e)=>{handleChange("koSurface",e.target.value)}}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="한국어를 입력"
        />
      </div>
      <div>
        {/*태그 */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          タグ選択
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.name)}
              className={`px-3 py-1 rounded-lg border ${
                form.tags.includes(tag.name)
                  ? "bg-gray-100"
                  : "bg-black text-white"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
        {/* 새 태그 추가 */}
      <input
        ref={inputRef}
        onCompositionStart={()=>setIsComposing(true)}
        onCompositionEnd={()=>{setIsComposing(false)}}
        type="text"
        placeholder="タグ入力（Enter または ボタン）"
        onKeyDown={handleKeyDown}
        className="w-full border rounded px-3 py-1"
      />
      <button
        type="button"
        onClick={() => {
          const value = inputRef.current?.value.trim() ?? "";
          addNewTag(value);
          if (inputRef.current) inputRef.current.value = "";
        }}
        className="mt-2 px-3 py-1 rounded bg-gray-200 border"
      >
        追加
      </button>
      <div>選択中：
      {/* 선택된 태그 표시 */}
      {form.tags.length === 0 ? (
        <span className="px-3 py-2 rounded-lg">
          なし
        </span>
      ) : (
        form.tags.map((tag, idx) => (
          <button 
            key={tag + idx}
            type="button"
            onClick={()=>toggleTag(tag) }
            className="px-3 py-1 rounded-lg border mr-2"
          >
            {tag}
          </button>
        ))
      )}
      </div>
      

      {/* 저장 버튼 */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          保存
        </button>
      </div>
      <div>
        <Link href="/" className="absolute top-4 left-10 text-lg">🏠</Link>
      </div>
    </div>
  );

  }