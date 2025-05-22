/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      boxShadow: {
        fancy: "-3px -3px #D70F13, 3px 3px #25B4C8",
      },
      fontFamily: {
        jura: ["Jura", "sans-serif"],
        juraVar: ["Jura Variable", "sans-serif"],
      },
      keyframes: {
        "move-colors": {
          "0%, 100%": { boxShadow: "-3px -3px #D70F13, 3px 3px #25B4C8" },
          "25%": { boxShadow: "3px -3px #D70F13, -3px 3px #25B4C8" },
          "50%": { boxShadow: "3px 3px #D70F13, -3px -3px #25B4C8" },
          "75%": { boxShadow: "-3px 3px #D70F13, 3px -3px #25B4C8" },
        },
        blink: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
      },

      // …and put this **beside** it, not inside keyframes
      animation: {
        "move-colors": "move-colors 0.7s ease-in-out infinite",
        blink: "blink 1s infinite",
        colors: "colors 3s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
