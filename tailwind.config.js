/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'page-flip': 'pageFlip 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
  safelist: ['perspective-1000', 'origin-right'],
}