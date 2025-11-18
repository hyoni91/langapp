import { useEffect, useMemo, useRef, useState } from "react";

//  durationMt 밀리초 단위
export function useCountdownInterval(durationMt : number| null){

    const [target, setTarget] = useState<number | null>(null); // 목표 시간 (밀리초 타임스탬프)
    const [leftMs, setLeftMs] = useState(0); // 남은 시간 (밀리초)
    const ifRef = useRef<number | null>(null); // interval ID

    //start
    useEffect(()=>{
        if (!durationMt) return;
        const time = Date.now()+ durationMt; // 목표 시간 계산
        setTarget(time);
        //남은 시간 초기화
        setLeftMs(Math.max(0, time - Date.now())); // 혹시 모를 딜레이 대비
    },[durationMt])

    //interval
    useEffect(()=>{
        if(!target) return;
        // interval 시작 tick 마다 남은 시간 갱신
        const tick = ()=>{setLeftMs(Math.max(0, target - Date.now()));}
        ifRef.current = window.setInterval(tick, 250); // 0.25초마다 갱신
        // 가시성 복귀 보정
        const onVisibility = () => tick(); 
        // tab 숨김 -> 보임 전환시 남은 시간 보정
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            if (ifRef.current) window.clearInterval(ifRef.current);
            document.removeEventListener("visibilitychange", onVisibility);
        };
},[target]) // target 바뀔 때마다 재설정


const totalSeconds = Math.ceil(leftMs / 1000); // 남은 시간 초단위
const label = useMemo(()=>{ // mm:ss 포맷
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    return `${mm}:${ss.toString().padStart(2,"0")}`;

},[totalSeconds]);// totalSeconds 바뀔 때마다 재계산

    // 반환값
  return { leftMs, totalSeconds, label, isOver: !!target && leftMs <= 0 };
}