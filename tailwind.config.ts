import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#FF6600",
          50: "#FFF3EB",
          100: "#FFE2CC",
          200: "#FFC299",
          300: "#FFA366",
          400: "#FF8533",
          500: "#FF6600",
          600: "#CC5200",
          700: "#993D00",
          800: "#662900",
          900: "#331400",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#B3B3B3",
          300: "#808080",
          400: "#4D4D4D",
          500: "#1A1A1A",
          600: "#141414",
          700: "#0D0D0D",
          800: "#070707",
          900: "#000000",
        },
        light: "#F5F5F5",
      },
    },
  },
  plugins: [],
};
export default config;
