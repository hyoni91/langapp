import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  extend: {
    colors: {
      brand: {
        50:  "#fff7f0",
        100: "#ffe9d5",
        200: "#ffd3ab",
        300: "#ffbd81",
        400: "#ffa758",
        500: "#ff9140", // 포인트(오렌지)
        600: "#e6782f",
        700: "#b95d24",
        800: "#8c451a",
        900: "#5f2e11",
      },
      mint:  { 100:"#e8fff6", 300:"#b9f4de", 500:"#75e0bf" },
      sky:   { 100:"#ecf7ff", 300:"#cfeaff", 500:"#8fd0ff" },
      lemon: { 100:"#fffbe6", 300:"#fff0a6", 500:"#ffe266" },
      berry: { 100:"#ffe8f1", 300:"#ffc2d8", 500:"#ff8fb7" },
      pink:  { 100:"#ffe4f1", 300:"#ffb3d8", 500:"#ff80bf" },
    },
    borderRadius: {
      'kids': '1.25rem', // 20px
      'blob': '2rem',    // 32px
    },
    boxShadow: {
      'soft': '0 6px 22px rgba(0,0,0,0.06)',
      'card': '0 8px 24px rgba(255,145,64,0.18)', // brand500 톤
    },
    fontSize: {
      'kid-lg': ['1.25rem', { lineHeight: '1.3' }],  // 20px
      'kid-xl': ['1.5rem',   { lineHeight: '1.25'}], // 24px
      'kid-2xl':['1.75rem',  { lineHeight: '1.2'  }],// 28px
    },
    fontFamily: {
        baloo: ["var(--font-baloo)", "cursive"],   // 영어 타이틀 (이미 있는 거)
        noto: ["var(--font-noto)", "sans-serif"],  // 일반 본문
        hachi: ["var(--font-hachi)", "cursive"],   // (둥근/팝)
        kaisei: ["var(--font-kaisei)", "serif"],   // (세리프)
        yomogi: ["var(--font-yomogi)", "cursive"], // (손글씨)
      },
    transitionDuration: { kids: '180ms' },
    scale: { '98': '.98', '102': '1.02' },
  }

},

  plugins: [forms, typography],
};
export default config;
