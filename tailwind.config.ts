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
        brand: {
          DEFAULT: "#111827",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          500: "#111827",
          600: "#0f172a",
          700: "#020617",
          800: "#020617",
          900: "#111827",
          navy: "#111827",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          elevated: "#FFFFFF",
          muted: "#F9FAFB",
        },
        canvas: {
          DEFAULT: "#F3F4F6",
        },
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          active: "#B45309",
          light: "#FEF3C7",
          50: "#FFFBEB",
        },
        verified: {
          DEFAULT: "#15803D",
          light: "#F0FDF4",
          border: "#BBF7D0",
        },
        subtle: {
          text: "#6B7280",
          border: "#E5E7EB",
          light: "#9CA3AF",
        },
        danger: {
          DEFAULT: "#B91C1C",
          light: "#FEF2F2",
          border: "#FECACA",
        },
        retailer: {
          amazon: "#ff9900",
          flipkart: "#2874f0",
          myntra: "#ff3f6c",
          ajio: "#2c4152",
          meesho: "#8b1874",
        },
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(17, 24, 39, 0.05), 0 1px 2px -1px rgba(17, 24, 39, 0.05)",
        "card-hover": "0 4px 12px -2px rgba(17, 24, 39, 0.08), 0 2px 6px -2px rgba(17, 24, 39, 0.04)",
        "dropdown": "0 10px 25px -5px rgba(17, 24, 39, 0.1), 0 8px 10px -6px rgba(17, 24, 39, 0.05)",
      },
      borderRadius: {
        "card": "0.75rem", // 12px
        "btn": "0.5rem",   // 8px
      },
    },
  },
  plugins: [],
};
export default config;
