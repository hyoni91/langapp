import "./globals.css";
import { Hachi_Maru_Pop, Kaisei_Opti, Yomogi } from "next/font/google";

const hachi = Hachi_Maru_Pop({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hachi",
});

const kaisei = Kaisei_Opti({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kaisei",
});

const yomogi = Yomogi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yomogi",
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${hachi.variable} ${kaisei.variable} ${yomogi.variable} min-h-screen`}>
      <body className="min-h-dvh bg-sky-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}


