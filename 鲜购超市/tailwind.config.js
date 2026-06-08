/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: "#FF6F61",
        dark: "#2D2D2D",
        light: "#F5F5F5",
      },
    },
  },
  plugins: [],
};
