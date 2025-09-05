/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'mobile': '400px',
      },
      colors: {
        'afs-blue': '#2563eb',
        'afs-blue-dark': '#1d4ed8',
      }
    },
  },
  plugins: [],
}
