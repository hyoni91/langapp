// 日本時間(jst) 타임존 설정

import { startOfMonth } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";


const tz = "Asia/Tokyo";


// 해당 날짜의 0시0분0초 ~ 23시59분59초 (jst) -> UTC로 변환해서 반환
export function getJstDate(date: Date = new Date()) {

    const z = toZonedTime(date, tz); // jst(벽시계시간)
    const startLocal = new Date(z.getFullYear(), z.getMonth(), z.getDate(), 0, 0, 0); // 시작 
    const endLocal = new Date(z.getFullYear(), z.getMonth(), z.getDate(), 23, 59, 59); // 종료
    
    return {
        start : fromZonedTime(startLocal, tz), // UTC
        end : fromZonedTime(endLocal, tz) // UTC
    }
}


// 해당 월의 1일 0시0분0초 (jst)
export function jstMonthStart(date = new Date()) {
  const z = toZonedTime(date, tz);
  return fromZonedTime(startOfMonth(z), tz);
}