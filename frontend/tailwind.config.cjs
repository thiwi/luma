const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dawnSand: 'var(--dawn-sand)',
        nightBlue: 'var(--night-blue)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
