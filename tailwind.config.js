/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a961',
          light: '#d4b978',
          dark: '#b8984f',
        },
        dark: {
          900: '#000000',
          800: '#050505',
          700: '#0a0a0a',
          600: '#1a1a1a',
          500: '#333333',
        },
      }
    },
  },
  plugins: [],
}