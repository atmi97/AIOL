import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0b6e6e",
          50: "#effafa",
          100: "#d5f1f1",
          200: "#ace4e4",
          300: "#75cece",
          400: "#40b0b0",
          500: "#218e8e",
          600: "#0b6e6e",
          700: "#0a5757",
          800: "#0a4646",
          900: "#0a3a3a",
        },
        accent: {
          gold: "#c08a1b",
          green: "#2f6b3a",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
