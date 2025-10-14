/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "readowl-purple": {
          DEFAULT: "#6750A4",
          light: "#9E85E0",
          dark: "#2F0959",
          extradark: "#23004B",
          extralight: "#F0EAFF",
        },
        "readowl-purple-medium": "#836DBE",
        "readowl-purple-hover": "#A78CF0", //'#AD92F5'
      },
      fontFamily: {
        display: ["'Yusei Magic'", 'system-ui', 'sans-serif'],
        serif: ["'PT Serif'", 'Georgia', 'serif'],
        yusei: ["'Yusei Magic'", 'system-ui', 'sans-serif'], // legado (uso existente)
      },
    },
  },
  plugins: [],
};
