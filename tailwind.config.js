/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./pages/**/*.html", "./src/**/*.js", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: "#FBF9F4",
          2: "#F3EEE1",
        },
        ink: {
          DEFAULT: "#1A1A17",
          muted: "#5C574A",
        },
        line: "#E5E0D2",
        accent: {
          DEFAULT: "#1F3A5C",
          dark: "#142840",
          soft: "#E7ECF1",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Public Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
      },
    },
  },
  plugins: [],
};
