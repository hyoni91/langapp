"use client"

import { useState } from "react"



export default function WordEditor(){
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
    }



    return(
        <>
        </>
    )
}