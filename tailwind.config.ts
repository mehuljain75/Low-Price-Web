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
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        retailer: {
          amazon: "#ff9900",
          flipkart: "#2874f0",
          myntra: "#ff3f6c",
          ajio: "#2c4152",
          meesho: "#8b1874",
        },
      },
    },
  },
  plugins: [],
};
export default config;
