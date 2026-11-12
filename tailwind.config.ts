import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        surface: "#FFFFFF",
        subtle: "#F4F4F5",
        hairline: "#E4E4E7",
        obsidian: "#09090B",
        ink: {
          primary: "#09090B",
          secondary: "#3F3F46",
          muted: "#71717A",
        },
        brand: {
          emerald: "#10B981",
          amber: "#D97706",
          rose: "#E11D48",
          zinc: "#E4E4E7",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
