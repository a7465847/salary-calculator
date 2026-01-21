/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 關鍵修正：加入這一行，告訴 Tailwind 我們要用 class 手動控制
  theme: {
    extend: {},
  },
  plugins: [],
}