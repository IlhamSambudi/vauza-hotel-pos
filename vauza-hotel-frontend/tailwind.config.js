export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Emerald 500
        primaryHover: "#059669",
        neu: "#eef2f5", // Neumorphic Base
        borderSoft: "#E4E7EC",
        textMain: "#374151",
        textSub: "#6B7280",
      },
      boxShadow: {
        'neu-flat': '5px 5px 10px #cad1d9, -5px -5px 10px #ffffff',
        'neu-pressed': 'inset 5px 5px 10px #cad1d9, inset -5px -5px 10px #ffffff',
        'neu-button': '6px 6px 12px #cad1d9, -6px -6px 12px #ffffff',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
