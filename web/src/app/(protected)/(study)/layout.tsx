// app/(protected)/(study)/layout.tsx
"use client";
import TimerProvider from "@/components/timer/TimerProvider";

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <TimerProvider>{children}</TimerProvider>;
}
