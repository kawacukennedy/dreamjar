/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary colors
        "dream-blue": "#2563EB",
        "sun-accent": "#F59E0B",
        // Secondary colors
        violet: "#7C3AED",
        mint: "#10B981",
        // Neutral colors
        neutral: {
          900: "#0F172A",
          500: "#6B7280",
          100: "#F3F4F6",
        },
        // Semantic colors
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#0EA5E9",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "56px", letterSpacing: "-0.02em" }],
        h2: ["36px", { lineHeight: "44px", letterSpacing: "-0.01em" }],
        h3: ["28px", { lineHeight: "36px" }],
        h4: ["20px", { lineHeight: "28px" }],
        h5: ["16px", { lineHeight: "24px" }],
        body: ["16px", { lineHeight: "24px" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "24px",
        full: "9999px",
      },
      boxShadow: {
        level0: "none",
        level1: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        level2: "0 4px 8px rgba(15,23,42,0.06)",
        level3: "0 8px 20px rgba(15,23,42,0.08)",
      },
    },
  },
  plugins: [],
};
