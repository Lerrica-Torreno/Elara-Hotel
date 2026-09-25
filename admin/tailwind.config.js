/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#0b221d",
          900: "#102f28",
          800: "#17483a",
          700: "#22624f"
        },
        mist: "#f3f7f5",
        cream: "#fbf8f2",
        gold: "#c8a56a",
        sage: "#a8b9af"
      },
      boxShadow: {
        soft: "0 14px 38px rgba(16, 47, 40, 0.08)"
      }
    }
  },
  plugins: []
};
