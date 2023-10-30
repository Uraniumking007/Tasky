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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
      // themes: {
      //   light: {
      //     extend: "light",
      //     colors: {
      //       // default: "#000000",
      //       primary: {
      //         50: "#F3F8F8",
      //         100: "#E7F2F2",
      //         200: "#C4DEDE",
      //         300: "#A1CACB",
      //         400: "#5AA3A3",
      //         500: "#137B7C",
      //         600: "#116F70",
      //         700: "#0B4A4A",
      //         800: "#093738",
      //         900: "#062525",
      //       },
      //       secondary: {
      //         50: "#FEFCF3",
      //         100: "#FDF8E8",
      //         200: "#FBEEC5",
      //         300: "#F9E4A1",
      //         400: "#F4D05B",
      //         500: "#EFBC15",
      //         600: "#D7A913",
      //         700: "#8F710D",
      //         800: "#6C5509",
      //         900: "#483806",
      //       },
      //       content1: "#A9A9A9",
      //       content2: "#f0ebf4",
      //       warning: "#e1a014",
      //       background: "#f0ebf4",
      //       foreground: "#000000",
      //       danger: "#f75964",
      //     },
      //   },
      //   dark: {
      //     extend: "dark",
      //     colors: {
      //       primary: {
      //         50: "#F7FFF9",
      //         100: "#EFFFF3",
      //         200: "#D7FEE1",
      //         300: "#BEFECE",
      //         400: "#8EFDAA",
      //         500: "#5DFC85",
      //         600: "#54E378",
      //         700: "#389750",
      //         800: "#2A713C",
      //         900: "#1C4C28",
      //       },
      //       secondary: {
      //         50: "#FBF8F4",
      //         100: "#F8F1E9",
      //         200: "#EDDCC9",
      //         300: "#E1C7A8",
      //         400: "#CB9E67",
      //         500: "#B57426",
      //         600: "#A36822",
      //         700: "#6D4617",
      //         800: "#513411",
      //         900: "#36230B",
      //       },
      //       content1: "#FBF8F4",
      //       content2: "#35353b",
      //       content3: "#FBF8F4",
      //       content4: "#35353b",
      //       warning: "#9a5c04",
      //       background: "#35353b",
      //       foreground: "#8994f9",
      //       danger: "#f3496b",
      //     },
      //   },
      // },
    }),
  ],
};
