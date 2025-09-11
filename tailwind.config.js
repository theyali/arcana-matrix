/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: { 'soft': '0 10px 30px rgba(0,0,0,0.15)' }
    },
  },
  plugins: [],
}
