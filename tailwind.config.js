/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clay.com 风格色板 (DESIGN.md)
        claude: {
          primary: '#0d9488',
          'primary-active': '#0f766e',
          'primary-disabled': '#e5e5e5',
          ink: '#1a1a1a',
          body: '#3a3a3a',
          'body-strong': '#1a1a1a',
          muted: '#595959',
          'muted-soft': '#787670',
          hairline: '#d9d4cc',
          'hairline-soft': '#e8e3da',
          canvas: '#fffaf0',
          'surface-soft': '#f5f0e5',
          'surface-card': '#efe8d8',
          'surface-cream-strong': '#ebe6d6',
          'surface-dark': '#0a1a1a',
          'surface-dark-elevated': '#1a2a2a',
          'surface-dark-soft': '#1a1a1a',
          'on-primary': '#ffffff',
          'on-dark': '#ffffff',
          'on-dark-soft': '#a0a0a0',
          'accent-teal': '#1a3a3a',
          'accent-amber': '#e8b94a',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        macaron: {
          blue: '#a8d8ea',      // 婴儿蓝
          peach: '#fcc8a8',     // 桃色
          yellow: '#f8e8a0',    // 奶油黄
          lavender: '#d4b8e0',  // 粉紫
          mint: '#a8e0c8',      // 薄荷绿
          pink: '#f8b8c8',      // 粉色
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'claude-xs': '6px',
        'claude-sm': '8px',
        'claude-md': '12px',
        'claude-lg': '16px',
        'claude-xl': '24px',
        'claude-pill': '9999px',
        'claude-full': '9999px',
      },
      spacing: {
        section: '160px',
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out backwards',
        'fade-in': 'fadeIn 0.3s ease-out backwards',
        'float': 'float 6s ease-in-out infinite',
        'card-enter': 'cardEnter 0.5s ease-out backwards',
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
