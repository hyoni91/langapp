"use client"

import { useState } from "react"

type props ={
    wordId : string;
}


export default function WordEditor({wordId}:props){
    const [kor, setKor] = useState("");
    const [jar, setJar] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    //파일 선택
    const handleFileChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if(file){
            setPreview(URL.createObjectURL(file)); //미리보기용
        }
    };;

    //저장
    const handleSave = async()=>{
        if(!imageFile){
            alert("画像を選択してくださ");
            return;
        }

        // 1. Firebase Storage 업로드 (여기는 나중에 구현)
        const imageUrl = "";
        const storagePath = "";
        const contentType = imageFile.type;

        // 2. API호출
        const res = await fetch(`api/words/${wordId || "new"}`,{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body :JSON.stringify({
                jaSurface: jar,
                koSurface: kor,
                imageUrl,
                storagePath,
                contentType
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
        <>
        </>
    )
}