/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#eeebff'
        },
        accent: {
          DEFAULT: '#ec4899',
          hover: '#db2777'
        }
      }
    },
  },
  plugins: [],
}
