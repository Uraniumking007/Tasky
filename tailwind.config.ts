import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      nunito: "Nunito, sans-serif",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    nextui({
      themes: {
        light: {
          extend: "light",
          colors: {
            primary: {
              50: "#F3F8F8",
              100: "#E7F2F2",
              200: "#C4DEDE",
              300: "#A1CACB",
              400: "#5AA3A3",
              500: "#137B7C",
              600: "#116F70",
              700: "#0B4A4A",
              800: "#093738",
              900: "#062525",
            },
            secondary: {
              50: "#FEFCF3",
              100: "#FDF8E8",
              200: "#FBEEC5",
              300: "#F9E4A1",
              400: "#F4D05B",
              500: "#EFBC15",
              600: "#D7A913",
              700: "#8F710D",
              800: "#6C5509",
              900: "#483806",
            },
            success: "#1fb761",
            warning: "#e1a014",
            background: "f0ebf4",
            foreground: "#000000",
            danger: "#f75964",
          },
        },
      },
    }),
  ],
};
