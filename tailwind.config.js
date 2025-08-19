// tailwind config는 색상, 간격, 폰트 크기 등을 일관되게 관리
// 기본적으로 모드, 컨텐츠, 테마, 플로그인으로 구성
// 컨텐츠는 어떤 파일에서 클래스를 사용할지 정의
// 테마는 색상, 폰트 크기, 간격 등을 정의
// 모드는 다크 모드와 라이트 모드를 정의
// 플로그인은 추가 기능을 정의

const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      fontSize: {
        // 기본보다 살짝 크게
        base: "1.0625rem", // 17px
        lg: "1.25rem",     // 20px
        xl: "1.5rem",      // 24px (헤더/버튼)
      },
      spacing: {
        // 터치 타겟 키우기용
        18: "4.5rem",
        22: "5.5rem",
      },
      colors: {
        brand: {
          DEFAULT: "#4F7CF7",
          light: "#7FA2FA",
          dark: "#2F5DD4",
        },
        accent2: "#FFB703",
      },
      boxShadow: {
        soft: "0 4px 14px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
