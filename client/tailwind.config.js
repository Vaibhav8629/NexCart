/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#27272A",
        input: "#27272A",
        ring: "#F59E0B",
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#F59E0B",
          foreground: "#111111",
        },
        secondary: {
          DEFAULT: "#FFB833",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT: "hsl(0 62.8% 30.6%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "#18181B",
          foreground: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#18181B",
          foreground: "#F59E0B",
        },
        popover: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#18181B",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}