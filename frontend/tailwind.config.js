/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fbfaf7',
          100: '#f5f3ec',
          200: '#e8e2d2',
          300: '#d7cbb1',
          400: '#c0ad8d',
          500: '#aa926f',
          600: '#947a59',
          700: '#7a6248',
          800: '#64513c',
          900: '#534434',
        },
        krishi: {
          primary: '#15803d',
          dark: '#14532d',
          light: '#dcfce7',
          accent: '#d97706',
          soil: '#78350f',
          cropA: '#15803d',
          cropB: '#d97706',
          border: '#166534',
          pathway: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
