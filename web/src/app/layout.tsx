// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  weight: ["400", "700"],         
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],         
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "My Language Learning App",
  description: "다국어 학습을 위한 프로그램",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-dvh flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}
