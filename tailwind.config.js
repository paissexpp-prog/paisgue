/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- TAMBAHKAN BARIS INI (PENTING!)
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Opsional: Agar font lebih profesional
      }
    },
  },
  plugins: [],
}

