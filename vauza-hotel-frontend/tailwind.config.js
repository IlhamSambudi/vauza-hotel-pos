export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neu: '#FFFFFF', // Surface
        primary: '#B142E8', // Purple
        primaryHover: '#7655FA',
        secondary: '#7655FA',
        bgMain: '#F7F8FA', // Light Gray
        textMain: '#1F2937',
        textSub: '#6B7280',
        success: '#097C69',
        warning: '#F59638',
        danger: '#F9357C',
      },
      boxShadow: {
        'card': '0 4px 18px rgba(0,0,0,0.05)',
        'neu-flat': '0 4px 18px rgba(0,0,0,0.05)', // Backward compatibility
        'neu-pressed': 'inner 0 0 0 transparent', // Disable pressed effect
        'neu-button': '0 4px 6px -1px rgba(177, 66, 232, 0.3), 0 2px 4px -1px rgba(177, 66, 232, 0.06)',
      },
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'bounce-small': 'bounceSmall 0.3s ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSmall: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
