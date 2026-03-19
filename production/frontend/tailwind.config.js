/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        gold: {
          DEFAULT: '#C97700',
          light: '#E8920A',
          deep: '#3D1F00',
          mid: '#7A4F00',
          soft: 'rgba(201,119,0,0.08)',
        },
        cream: {
          DEFAULT: '#FFFDF5',
          2: '#FFF8E5',
          3: '#FEF3D0',
        },
      },
    },
  },
  plugins: [],
};
