import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#ffb4c8",
        lilac: "#c4b5fd",
        ink: "#0f0f1a"
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.35)",
        card: "0 4px 16px rgba(0, 0, 0, 0.4)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 18px 32px rgba(0,0,0,0.5)"
      },
      fontFamily: {
        title: ["Segoe UI Light", "PingFang SC Light", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
