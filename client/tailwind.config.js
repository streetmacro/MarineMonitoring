/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'berth-free': '#22c55e',
        'berth-repair': '#eab308',
        'berth-awaiting': '#ef4444',
      }
    },
  },
  plugins: [],
}
