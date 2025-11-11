// import { useExtendSession } from "./useExtendSession";

import { useStudySession } from "@/hooks/useStudySession";
import { useState } from "react";


type Props = {
    minutes? : number;
    className? : string;
    onDone? : ()=>void;
}

export default function ExtendSessionButton({
    minutes = 5, //5分指定
    className,
    onDone,
  }:Props){
    const { extendSession } = useStudySession();
    const [ loading, setLoading ] = useState(false);

  const handleExtend = async () => {
    try{
      setLoading(true);
      await extendSession(minutes);
      onDone?.();
    }catch(error){
      console.error("延長失敗:", error);
      alert("延長に失敗しました");
    }finally{
      setLoading(false);
    }
  }

   return (
    <button
      disabled={loading}
      onClick={handleExtend}
      className={className ?? "rounded-xl px-4 py-2 border"}
    >
      {loading ? "延長中..." : `${minutes}分延長`}
    </button>
  );
}