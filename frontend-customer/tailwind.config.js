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
        cream: "#fbf8f2",
        mist: "#f3f7f5",
        gold: "#c8a56a",
        sand: "#eadfce",
        sage: "#a8b9af"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(11, 34, 29, 0.10)",
        lift: "0 20px 55px rgba(11, 34, 29, 0.14)"
      }
    }
  },
  plugins: []
};
