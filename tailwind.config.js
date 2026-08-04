/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude/Anthropic 暖调编辑色板 (DESIGN.md)
        claude: {
          primary: '#cc785c',
          'primary-active': '#a9583e',
          'primary-disabled': '#e6dfd8',
          ink: '#141413',
          body: '#3d3d3a',
          'body-strong': '#252523',
          muted: '#6c6a64',
          'muted-soft': '#8e8b82',
          hairline: '#e6dfd8',
          'hairline-soft': '#ebe6df',
          canvas: '#faf9f5',
          'surface-soft': '#f5f0e8',
          'surface-card': '#efe9de',
          'surface-cream-strong': '#e8e0d2',
          'surface-dark': '#181715',
          'surface-dark-elevated': '#252320',
          'surface-dark-soft': '#1f1e1b',
          'on-primary': '#ffffff',
          'on-dark': '#faf9f5',
          'on-dark-soft': '#a09d96',
          'accent-teal': '#5db8a6',
          'accent-amber': '#e8a55a',
          success: '#5db872',
          warning: '#d4a017',
          error: '#c64545',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Tiempos Headline"', 'Garamond', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'claude-xs': '4px',
        'claude-sm': '6px',
        'claude-md': '8px',
        'claude-lg': '12px',
        'claude-xl': '16px',
        'claude-pill': '9999px',
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'card-enter': 'cardEnter 0.5s ease-out both',
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
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
