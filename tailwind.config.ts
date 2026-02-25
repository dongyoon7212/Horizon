import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 배경
        "bg-deep":    "var(--bg-deep)",
        "bg-mid":     "var(--bg-mid)",
        "bg-surface": "var(--bg-surface)",
        // 지평선 (뜨는 AI)
        fire:   "var(--horizon-fire)",
        gold:   "var(--horizon-gold)",
        peach:  "var(--horizon-peach)",
        // 달빛 (지는 AI)
        dusk:   "var(--moon-dusk)",
        indigo: "var(--moon-indigo)",
        silver: "var(--moon-silver)",
        // 텍스트
        star:   "var(--text-star)",
        muted:  "var(--text-muted)",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        data:    ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "horizon-gradient": "linear-gradient(to top, #1a0a05 0%, #2d0f0a 8%, #ff6b35 15%, #1a0520 30%, #0d0818 60%, #0a0612 100%)",
      },
      boxShadow: {
        "glow-rise": "0 0 30px rgba(255,107,53,0.4), 0 0 60px rgba(255,107,53,0.15)",
        "glow-set":  "0 0 30px rgba(155,89,182,0.4), 0 0 60px rgba(155,89,182,0.15)",
        "glow-star": "0 0 8px rgba(232,224,240,0.6)",
      },
      animation: {
        "horizon-rise":    "horizon-rise 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-rise":       "fade-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "live-pulse":      "live-pulse 1.8s ease-out infinite",
        "sun-pulse":       "sun-pulse 4s ease-in-out infinite",
        "shimmer":         "horizon-shimmer 2s linear infinite",
        "count-glow-rise": "count-glow-rise 2s ease-in-out infinite",
        "count-glow-set":  "count-glow-set 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
