import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF8F5',
          100: '#F5EFEA',
          200: '#EBDCD0',
          300: '#DDC4B0',
          400: '#C79E7E',
          500: '#B07B52',
          600: '#945F38',
          700: '#754728',
          800: '#5A341E',
          900: '#3D2213',
          950: '#26140B',
        },
      },
      borderRadius: {
        custom: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
