/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kraken 风格色板 (DESIGN.md)
        kraken: {
          primary: '#7132f5',
          'primary-dark': '#5741d8',
          'primary-deep': '#5b1ecf',
          'primary-subtle': 'rgba(133,91,251,0.16)',
          ink: '#101114',
          neutral: '#686b82',
          muted: '#9497a9',
          'border': '#dedee5',
          'border-subtle': 'rgba(104,107,130,0.24)',
          canvas: '#f0eef5',
          surface: '#ffffff',
          'surface-soft': 'rgba(148,151,169,0.08)',
          success: '#149e61',
          'success-dark': '#026b3f',
          'success-subtle': 'rgba(20,158,97,0.16)',
          'neutral-subtle': 'rgba(104,107,130,0.12)',
          'neutral-dark': '#484b5e',
          error: '#d9304e',
        },
      },
      fontFamily: {
        display: ['"Kraken-Brand"', '"IBM Plex Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['"Kraken-Product"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'kraken-xs': '3px',
        'kraken-sm': '6px',
        'kraken': '8px',
        'kraken-md': '10px',
        'kraken-lg': '12px',
        'kraken-xl': '16px',
        'kraken-full': '9999px',
        'kraken-half': '50%',
      },
      boxShadow: {
        'kraken': 'rgba(0,0,0,0.03) 0px 4px 24px',
        'kraken-micro': 'rgba(16,24,40,0.04) 0px 1px 4px',
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out backwards',
        'fade-in': 'fadeIn 0.3s ease-out backwards',
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
      },
    },
  },
  plugins: [],
}
