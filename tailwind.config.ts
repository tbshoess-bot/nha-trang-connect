import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sri Lanka'nın deniz, kum ve gün batımı tonları
        sea: { 50: "#eef7f6", 200: "#a9d9d3", 500: "#1f8a7c", 700: "#115f54", 900: "#0a3a33" },
        sand: { 50: "#fdfbf4", 100: "#f7f1e1", 300: "#e9dcb8" },
        sunset: { 400: "#f0a868", 500: "#e2823f", 600: "#c0632a" },
        ink: { 700: "#33312c", 900: "#1c1b18" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
