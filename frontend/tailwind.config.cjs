const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dawnSand: {
          50: 'var(--dawn-sand-4)',
          100: 'var(--dawn-sand-3)',
          200: 'var(--dawn-sand-2)',
          300: 'var(--dawn-sand-1)',
          400: 'var(--dawn-sand-0)',
        },
        nightBlue: {
          400: 'var(--night-blue-0)',
          500: 'var(--night-blue-1)',
          600: 'var(--night-blue-2)',
          700: 'var(--night-blue-3)',
          800: 'var(--night-blue-4)',
        },
        mistGrey: {
          400: 'var(--mist-grey-0)',
          500: 'var(--mist-grey-1)',
          600: 'var(--mist-grey-2)',
        },
        waveTeal: {
          400: 'var(--wave-teal-0)',
        },
        emberCoral: {
          400: 'var(--ember-coral-0)',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
      },
      boxShadow: {
        ambient: 'var(--shadow-ambient)',
        key: 'var(--shadow-key)',
        spread: 'var(--shadow-spread)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
