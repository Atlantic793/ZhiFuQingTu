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
          pink: '#D4A5A5',
          blue: '#B8C4C4',
          green: '#B8C9B5',
          yellow: '#D4C9B5',
          purple: '#C4B8C9',
          coral: '#C9B8B5',
          light: '#F5F5F0',
          text: '#5C5C5C',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
