import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ceff",
          300: "#82adff",
          400: "#4f83ff",
          500: "#2b5cf5",
          600: "#1c42d1",
          700: "#1832a3",
          800: "#182c7f",
          900: "#182a63",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
