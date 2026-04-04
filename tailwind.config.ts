import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#e0eaff",
          200: "#bcd0ff",
          300: "#85aeff",
          400: "#4d84ff",
          500: "#1f5bff",
          600: "#0a3bef",
          700: "#082fcf",
          800: "#0b27a8",
          900: "#0e2483",
          950: "#0A1628",
        },
        teal: {
          50: "#f0fdfc",
          100: "#ccfbf7",
          200: "#99f6ee",
          300: "#5ee7df",
          400: "#2dd4cc",
          500: "#14b8b1",
          600: "#0E7490",
          700: "#0f6275",
          800: "#114d5e",
          900: "#124050",
          950: "#082832",
        },
        gold: {
          50: "#fdf8ee",
          100: "#f9edd2",
          200: "#f2d9a0",
          300: "#e9bf65",
          400: "#D4A853",
          500: "#c98f30",
          600: "#b07024",
          700: "#8f5321",
          800: "#754421",
          900: "#61391f",
        },
        seagreen: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      backgroundImage: {
        "wave-pattern":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M0 50 Q50 20 100 50 Q150 80 200 50' stroke='%230E7490' stroke-width='1' fill='none' opacity='0.1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
