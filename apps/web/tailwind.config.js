/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#05060b',
          card: '#0d0f19',
          border: '#1f2438',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          gold: '#c5a880',
        }
      }
    },
  },
  plugins: [],
}
