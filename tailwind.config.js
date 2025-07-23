const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        dark: "var(--color-dark)",
        text: "var(--color-text)",
        bg: "var(--color-bg)",
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
          "--color-text": "var(--color-dark)",
          "--color-bg": "var(--color-base)",
        },
      });
    }),
  ],
};
