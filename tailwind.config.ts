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
        "bu-blue": {
          DEFAULT: "#1a4f8a",
          dark: "#133a66",
          light: "#2d6cb0",
          50: "#eef4fb",
          100: "#dbe7f4",
        },
        "bu-gold": "#c9a44c",
        ink: {
          900: "#14202e",
          700: "#3a4859",
          500: "#677889",
          400: "#8b99a8",
          300: "#b9c3cf",
          200: "#dde3eb",
          100: "#eef1f6",
          50: "#f6f8fb",
        },
        paper: "#ffffff",
        "site-bg": "#f0f3f8",
        success: "#137a4a",
        "success-bg": "#e6f4ec",
        warning: "#a86a14",
        "warning-bg": "#fcf3e1",
        danger: "#b53030",
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "Noto Sans Thai", "system-ui", "sans-serif"],
        ibm: ["var(--font-ibm-plex)", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
      screens: {
        nav: "980px",
      },
    },
  },
  plugins: [],
};
export default config;
