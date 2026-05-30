import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0b0b",
        card: "#151515",
        accent: "#5865F2",
        cyanAccent: "#00C2FF",
      },
      boxShadow: {
        glass: "0 12px 40px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
