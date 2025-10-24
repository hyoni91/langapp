//** Protected study Layout */

"use client";

import StudyTimerBadge from "@/components/timer/StudyTimerBadge";
import TimerProvider from "@/components/timer/TimerProvider";


export default function StudyLayout({ children }: { children: React.ReactNode }) {
  
  return <TimerProvider>
      {children}
      <StudyTimerBadge onEnd={() => null} />
    </TimerProvider>
}

