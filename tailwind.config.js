const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#F9FAFB",
        primary: "#4CAF91",
        accent: "#FFD265",
        dark: "#1F2937",
        text: "#111827",
        bg: "#F9FAFB",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--color-base": "#F9FAFB",
          "--color-primary": "#4CAF91",
          "--color-accent": "#FFD265",
          "--color-dark": "#1F2937",
          "--color-text": "#111827",
          "--color-bg": "#F9FAFB",
        },
      });
    }),
  ],
};
