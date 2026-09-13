import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cine: {
          950: "#07090e",
          900: "#0c1017",
          850: "#111722",
          800: "#161e2e",
          700: "#222f46",
          600: "#344563",
          500: "#4f6385",
          accent: "#f59e0b",
          gold: "#fbbf24",
          red: "#e11d48",
          ruby: "#be123c",
          neon: "#06b6d4",
          purple: "#8b5cf6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-glow": "radial-gradient(ellipse at top, rgba(245, 158, 11, 0.15), transparent 70%)",
        "screen-glow": "linear-gradient(180deg, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0.03) 60%, transparent 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-screen": "glowScreen 4s ease-in-out infinite alternate",
      },
      keyframes: {
        glowScreen: {
          "0%": { opacity: "0.4", transform: "scale(0.98)" },
          "100%": { opacity: "0.85", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
