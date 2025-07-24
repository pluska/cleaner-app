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
  safelist: [
    {
      pattern:
        /(bg|text|border|hover:bg|hover:text|focus-visible:ring)-(primary|accent|text|base)/,
    },
  ],
};
