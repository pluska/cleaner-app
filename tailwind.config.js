module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#FFFFFF",
        primary: "#3B82F6",
        secondary: "#10B981",
        dark: "#111827",
      },
    },
  },
  safelist: [
    {
      pattern:
        /(bg|text|border|hover:bg|hover:text|focus:bg|focus:text|focus:ring|ring)-(primary|secondary|dark|base)/,
    },
    {
      pattern: /(text|bg|ring)-(secondary|secondary\/\d+)/,
    },
  ],
};
