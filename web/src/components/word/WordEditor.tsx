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
        <div>
            <div>
                <label>画像アップロード:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {form.preview && <img src={form.preview} alt="preview" width={200} />}
            </div>
            <div>
                <label>日本語:</label>
                <input
                type="text"
                value={form.jaSurface}
                onChange={(e) => handleChange("jaSurface", e.target.value)}
                />
            </div>

            <div>
                <label>韓国語:</label>
                <input
                type="text"
                value={form.koSurface}
                onChange={(e) => handleChange("koSurface", e.target.value)}
                />
            </div>

            <button onClick={handleSave}>保存</button>
            </div>
  );

  }