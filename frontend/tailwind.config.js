/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        accent: "#00D1FF",
        success: "#2ECC71",
        danger: "#E74C3C",
        backgroundLight: "#F7F7FB",
        backgroundDark: "#0F1724",
      },
    },
  },
  plugins: [],
};
