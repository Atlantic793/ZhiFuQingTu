/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          pink: '#C9B8B5',
          blue: '#B8C4C4',
          green: '#B8C9B5',
          yellow: '#D4C9B5',
          purple: '#C4B8C9',
          coral: '#D4A5A5',
          bg: '#F5F2EF',
          card: '#FFFFFF',
          text: '#5A5A5A',
          light: '#E8E4DF',
        }
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        display: ['Noto Serif SC', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(168, 160, 155, 0.15)',
        hover: '0 8px 30px rgba(168, 160, 155, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
