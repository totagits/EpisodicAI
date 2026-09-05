/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:     '#0f1117',   // lighter — slate dark (not pure black)
          card:   '#1a1d2e',   // lighter cards — deep navy
          border: '#2d3154',   // lighter borders — slate blue
          violet: '#a78bfa',   // brighter violet
          cyan:   '#22d3ee',   // brighter cyan
          amber:  '#fbbf24',   // brighter amber
          gold:   '#f0c060',   // brighter warm gold — matches the logo
        }
      }
    },
  },
  plugins: [],
}
