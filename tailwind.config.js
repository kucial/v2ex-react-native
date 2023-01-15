/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          750: '#333333',
          950: '#101010',
        },
      },
      borderWidth: {},
    },
  },
  plugins: [],
}
