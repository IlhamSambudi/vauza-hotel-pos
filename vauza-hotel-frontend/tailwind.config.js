export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neu: '#FFFFFF', // Pure White for cards
        bgMain: '#F8FAFC', // Slate-50 (Off-white/Gray)
        bgSection: '#FFFFFF', // Pure White for sections

        // PRIMARY (Soft SaaS Blue - Indigo)
        primary: '#4F46E5', // Indigo-600
        primaryHover: '#4338CA', // Indigo-700

        // SECONDARY ACCENTS (Pastels)
        accentOrange: '#FFEDD5', // Orange-100
        accentGreen: '#DCFCE7', // Green-100
        accentPurple: '#F3E8FF', // Purple-100
        accentCyan: '#CFFAFE', // Cyan-100
        accentPink: '#FCE7F3', // Pink-100

        // FUNCTIONAL
        success: '#10B981', // Emerald-500
        warning: '#F59E0B', // Amber-500
        danger: '#EF4444', // Red-500

        // TEXT (Slate)
        textMain: '#1E293B', // Slate-800
        textSub: '#64748B', // Slate-500

        // Legacy mappings to prevent breaks
        secondary: '#E2E8F0', // Slate-200 (Neutral)
        accentSubtle: '#F1F5F9', // Slate-100 (Light Gray)
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Very soft
        'neu-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px', // 2xl equivalent
        'pill': '9999px',
        '2xl': '1rem',
        '3xl': '1.5rem',
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
          '50%': { transform: 'scale(0.98)' },
        }
      },
    },
  },
  plugins: [],
};
