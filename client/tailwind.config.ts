import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE2D5',
          300: '#DDD0BF',
          400: '#C2B099',
          500: '#9E8B75',
          800: '#262422',
          900: '#181716',
          950: '#0F0E0D',
        },
        accent: {
          50: '#FAF5F0',
          100: '#F3E8DE',
          200: '#E6CFBC',
          300: '#D5B095',
          400: '#C48D6C',
          500: '#B26F45',
          600: '#9A5B36',
          700: '#7B452B',
          800: '#643926',
          900: '#4D2C1E',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        custom: '12px',
        card: '14px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
