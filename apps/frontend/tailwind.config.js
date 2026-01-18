/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        eth: {
          50: "#f0f5ff",
          100: "#e0eaff",
          200: "#c7d7fe",
          300: "#a4bbfc",
          400: "#7f9cf8",
          500: "#627eea",
          600: "#4c5fe0",
          700: "#3f4cc5",
          800: "#35409f",
          900: "#303a7e",
        },
      },
    },
  },
  plugins: [],
};
