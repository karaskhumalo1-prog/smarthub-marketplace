/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SmartHub brand palette
        gold: {
          DEFAULT: '#F5B800',
          bright: '#FFC800',
          dark: '#D9A400',
        },
        navy: {
          DEFAULT: '#0B1B3D',
          deep: '#0B132B',
          light: '#16264F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}
