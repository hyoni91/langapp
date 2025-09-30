/* eslint-disable @next/next/no-img-element */
"use client"

import { WordForm } from "@/types/word";
import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";

type props ={
    wordId : string;
}

export default function WordEditor({wordId}:props){

    const [form, setForm] = useState<WordForm>({
        jaSurface: "",
        koSurface: "",
        imageFile: null,
        preview:null,
    })

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
        const storagePath = `images/${form.imageFile.name}-${Date.now()}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes (storageRef, form.imageFile, {
            contentType : form.imageFile.type,
        })

        //1-2. download url 얻기
        const imageUrl = await getDownloadURL(storageRef);

        console.log("✅ 업로드 성공:", { storagePath, imageUrl });


        // 2. API 호출
        const res = await fetch(`/api/words/${wordId || "new"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jaSurface: form.jaSurface,
            koSurface: form.koSurface,
            imageUrl,
            storagePath,
            contentType : form.imageFile.type,
        }),
        });

        if(!res){
            alert("保存できませんでした。")
            return;
        }

        const data = await res.json();
        console.log("保存成功:", data);
        alert("保存しました！");
    }



    return(
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      {/* 이미지 업로드 */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          画像アップロード
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
        <div className="mt-3">
          {/* 업로드 미리보기 */}
          <img
            src={form.preview ?? undefined}
            alt="preview"
            width={400}
            className="rounded-lg border object-cover w-48 h-32"
          />
        </div>
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
    </div>
  );

  }