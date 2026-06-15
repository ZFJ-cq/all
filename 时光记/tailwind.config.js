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
        morandi: {
          blue: '#A8C5DA',
          'blue-dark': '#7BA7C2',
          'blue-light': '#C8DDE9',
          pink: '#E8B4B8',
          'pink-dark': '#D4919A',
          'pink-light': '#F2D4D7',
          cream: '#F5F0EB',
          coral: '#E8927C',
          'coral-dark': '#D47A64',
        },
        surface: {
          light: '#FAF8F5',
          dark: '#1A1A2E',
          'card-light': '#FFFFFF',
          'card-dark': '#252540',
          'hover-light': '#F0EDE8',
          'hover-dark': '#2E2E4A',
        },
        text: {
          primary: '#2D2D3A',
          secondary: '#6B6B80',
          'primary-dark': '#E8E6F0',
          'secondary-dark': '#9B9BB0',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'modal': '20px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'modal': '0 16px 48px rgba(0, 0, 0, 0.15)',
        'fab': '0 4px 16px rgba(232, 146, 124, 0.4)',
        'fab-hover': '0 6px 24px rgba(232, 146, 124, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.3s ease-in forwards',
        'spin-slow': 'spin 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
