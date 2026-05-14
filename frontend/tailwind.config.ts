import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201c",
        field: "#0f6b4f",
        mist: "#eff7f2",
        line: "#d7e2db"
      },
      boxShadow: {
        soft: "0 14px 35px rgba(18, 43, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

