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
        cyber: {
          black: "#0a0e27",
          dark: "#1a1f3a",
          blue: "#00f0ff",
          pink: "#ff006e",
          purple: "#8b5cf6",
          green: "#00ff41",
          yellow: "#ffdd00",
        },
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
        "flicker": "flicker 0.15s infinite",
        "scan": "scan 8s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #00f0ff, 0 0 10px #00f0ff" },
          "100%": { boxShadow: "0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 30px #00f0ff" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
