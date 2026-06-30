import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sri Lanka bayrağı renkleri — bordo, altın, orman yeşili
        crimson: {
          50: "#fdf2f5",
          100: "#fce3eb",
          200: "#f4a8bf",
          500: "#8D153A",
          700: "#6B0E2C",
          900: "#430818",
        },
        gold: {
          50: "#fffbf0",
          100: "#fff3cc",
          200: "#ffe49a",
          300: "#ffd75e",
          400: "#f5a001",
          500: "#d48900",
          700: "#a86c00",
        },
        forest: {
          50: "#f0f7f2",
          100: "#d6edd9",
          500: "#1E5631",
          700: "#133D22",
        },
        cream: {
          50: "#FDFAF5",
          100: "#F7F2E8",
          300: "#EDE5D0",
        },
        ink: {
          700: "#33312c",
          900: "#1c1b18",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(51,49,44,0.08)",
        "card-hover": "0 4px 16px 0 rgba(141,21,58,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
