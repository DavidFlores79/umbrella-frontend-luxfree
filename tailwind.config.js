/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // HubSpot-Inspired Color Palette
        primary: {
          DEFAULT: '#FF7A59', // Coral - Primary actions, CTA buttons
          50: '#FFF8F6',
          100: '#FFF1EE',
          200: '#FFE0D9',
          300: '#FFCFC4',
          400: '#FFAE9A',
          500: '#FF7A59',  // Base
          600: '#FF5533',
          700: '#E6381F',
          800: '#B32D19',
          900: '#802113'
        },
        text: {
          DEFAULT: '#2D3E50', // Pickled Bluewood - Primary text
          light: '#6B7C93',   // Secondary text
          lighter: '#A1B1C4'  // Tertiary text
        },
        'text-dark': {
          DEFAULT: '#E5E9F0',
          light: '#B8C2D4',
          lighter: '#8A99B0'
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#FFF1EE', // Forget Me Not
          tertiary: '#F7F9FB'
        },
        'background-dark': {
          DEFAULT: '#1A1F2E',
          secondary: '#242936',
          tertiary: '#2D3342'
        },
        accent: {
          blue: '#0091AE',    // Trust, info
          green: '#00A862',   // Success
          yellow: '#FFB800',  // Warning
          red: '#F2545B'      // Error, danger
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '100': '25rem',   // 400px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
