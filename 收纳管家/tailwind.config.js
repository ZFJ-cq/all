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
        primary: {
          DEFAULT: '#4A90E2',
          50: '#EBF3FC',
          100: '#D6E7F9',
          200: '#ADCFF3',
          300: '#84B7ED',
          400: '#5B9FE7',
          500: '#4A90E2',
          600: '#3A7BD4',
          700: '#2E63AB',
          800: '#234A81',
          900: '#173157',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC2C2',
          300: '#FFA3A3',
          400: '#FF8585',
          500: '#FF6B6B',
          600: '#E54B4B',
          700: '#B33A3A',
          800: '#802A2A',
          900: '#4D1A1A',
        },
        surface: {
          DEFAULT: '#F5F7FA',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
