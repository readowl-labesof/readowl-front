/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'readowl-purple': {
          DEFAULT: '#6750A4',   // Roxo
          light: '#9E85E0',     // Roxo Claro
          dark: '#2F0959',      // Roxo Escuro
          extradark: '#23004B', // Roxo Extra Escuro
          extralight: '#F0EAFF' // Roxo Extra Claro
        },
        'readowl-purple-medium': '#836DBE', // Roxo Médio
      }
    },
  },
  plugins: [],
}