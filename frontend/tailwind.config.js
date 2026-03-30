/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6C63FF",
          dark: "#5548e8",
        },
      },
      keyframes: {
        slideInFromRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(8px, -12px)" },
          "66%": { transform: "translate(-6px, 8px)" },
        },
        floatSlow2: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(-10px, 10px) rotate(3deg)" },
        },
        homeWelcome: {
          "0%": { opacity: "0", transform: "translateY(0.5rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "slide-in": "slideInFromRight 0.4s ease-out forwards",
        "float-slow": "floatSlow 18s ease-in-out infinite",
        "float-slow2": "floatSlow2 22s ease-in-out infinite",
        "home-welcome": "homeWelcome 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "glow": "glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
