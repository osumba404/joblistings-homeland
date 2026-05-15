import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        homeland: {
          green: "#2E7D32",
          yellow: "#F9A825",
          orange: "#E65100",
          dark: "#1A1A2E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
