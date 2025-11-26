/**
 * TAILWIND CSS CONFIGURATION - HubSpot Design System
 *
 * This is a REFERENCE file showing the complete tailwind.config.js
 * implementation with HubSpot brand colors and dark mode support.
 *
 * To apply: Copy contents to /tailwind.config.js in project root
 *
 * Related files:
 * - postcss.config.js: PostCSS plugin configuration
 * - src/styles.css: Tailwind directives entry point
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable dark mode using class strategy
  darkMode: 'class',

  // Content paths for Tailwind to scan
  content: [
    './src/**/*.{html,ts}',
    './src/index.html',
  ],

  theme: {
    extend: {
      // HubSpot Brand Color Palette
      colors: {
        // Light Mode Colors
        coral: {
          50: '#FFF8F5',
          100: '#FFE6E0',
          200: '#FFCFC4',
          300: '#FFB5A0',
          400: '#FF9F88',
          500: '#FF7A59', // Primary HubSpot Coral
          600: '#E65A3B',
          700: '#CC4A26',
          800: '#B33A1F',
          900: '#8B2C18',
          950: '#5C1C0F',
        },

        blue: {
          50: '#F0F6FF',
          100: '#E0ECFF',
          200: '#C2DAFF',
          300: '#95BDFF',
          400: '#5BA3FF',
          500: '#0B8DEF', // Secondary Action Blue
          600: '#0A7AC5',
          700: '#0855A0',
          800: '#064285',
          900: '#0A3870',
          950: '#051E3E',
        },

        'text': {
          DEFAULT: '#2D3E50', // Primary text dark blue-gray
          light: '#56616C',  // Secondary text lighter gray
          lighter: '#8B959E', // Tertiary text
          inverse: '#E8EEF5', // Light mode inverse (for dark bg)
        },

        'bg': {
          light: '#FFF1EE', // Light peach background
          white: '#FFFFFF',
          hover: '#F5E8E3', // Slightly darker peach for hover
        },

        'surface': {
          light: '#FFFFFF',
          dark: '#1A1F27',  // For dark mode
        },

        'border': {
          light: '#DDD5D0',  // Light brown-gray
          dark: '#2D3540',   // For dark mode
        },

        // Semantic Colors
        success: {
          50: '#F0FDF4',
          500: '#27AE60',
          600: '#1E8449',
          700: '#166534',
        },

        warning: {
          50: '#FFFBEB',
          500: '#F39C12',
          600: '#D97706',
          700: '#B45309',
        },

        error: {
          50: '#FEF2F2',
          500: '#E74C3C',
          600: '#DC2626',
          700: '#991B1B',
        },

        info: {
          50: '#EFF6FF',
          500: '#0B8DEF',
          600: '#0A7AC5',
          700: '#0855A0',
        },

        // Neutral Grays
        gray: {
          50: '#F9F9F9',
          100: '#EFEFEF',
          200: '#E3E3E3',
          300: '#D6D6D6',
          400: '#9C9C9C',
          500: '#656565',
          600: '#575757',
          700: '#3F3F3F',
          800: '#313131',
          900: '#1F1F1F',
        },

        // Dark Mode Palette (override light mode in dark: prefix)
        'dark-bg': {
          primary: '#0F1419',  // Primary dark background
          secondary: '#1A1F27', // Secondary/card background
          tertiary: '#252D36',  // Tertiary surface
        },
      },

      // Extended spacing for custom layouts
      spacing: {
        'sidebar': '250px',
        'header': '64px',
      },

      // Custom animations
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },

      // Custom shadows matching HubSpot design
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(45, 62, 80, 0.05)',
        'md': '0 4px 6px -1px rgba(45, 62, 80, 0.1), 0 2px 4px -1px rgba(45, 62, 80, 0.06)',
        'lg': '0 10px 15px -3px rgba(45, 62, 80, 0.1), 0 4px 6px -2px rgba(45, 62, 80, 0.05)',
        'xl': '0 20px 25px -5px rgba(45, 62, 80, 0.1), 0 10px 10px -5px rgba(45, 62, 80, 0.04)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },

      // Font configuration
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Outfit"', 'ui-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },

      // Responsive breakpoints
      screens: {
        'xs': '0px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        'full': '9999px',
      },

      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },

      // Transition timing
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
    },
  },

  // Plugin configurations
  plugins: [
    // Custom component layer definitions
    function({ addComponents, theme }) {
      const colors = theme('colors');

      addComponents({
        // Button variants
        '.btn': [
          'px-4 py-2.5 rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ],

        '.btn-primary': [
          '@apply btn bg-coral text-white hover:bg-coral-600',
          'focus:ring-coral-500',
          'dark:bg-coral-600 dark:hover:bg-coral-700',
        ],

        '.btn-secondary': [
          '@apply btn bg-gray-100 text-text hover:bg-gray-200',
          'focus:ring-gray-500',
          'dark:bg-gray-700 dark:text-text-inverse dark:hover:bg-gray-600',
        ],

        '.btn-ghost': [
          '@apply btn bg-transparent text-coral hover:bg-coral hover:bg-opacity-10',
          'focus:ring-coral-500',
          'dark:text-coral-400 dark:hover:bg-coral dark:hover:bg-opacity-20',
        ],

        '.btn-danger': [
          '@apply btn bg-error-500 text-white hover:bg-error-600',
          'focus:ring-error-500',
        ],

        // Card styles
        '.card': [
          'bg-white rounded-xl shadow-md p-6 border border-border-light',
          'dark:bg-dark-bg-secondary dark:border-border-dark dark:shadow-dark-md',
          'transition-shadow duration-200',
        ],

        '.card-elevated': [
          '@apply card shadow-lg dark:shadow-dark-lg',
        ],

        '.card-outlined': [
          'bg-transparent rounded-xl border-2 border-border-light p-6',
          'dark:border-border-dark',
        ],

        // Input styles
        '.input-base': [
          'w-full px-3 py-2.5 border border-border-light rounded-lg',
          'bg-white text-text placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'transition-colors duration-150',
          'dark:bg-dark-bg-secondary dark:border-border-dark dark:text-text-inverse',
          'dark:placeholder-gray-500 dark:focus:ring-coral-400',
        ],

        '.input-error': [
          '@apply border-error-500 focus:ring-error-500',
        ],

        '.input-success': [
          '@apply border-success-500 focus:ring-success-500',
        ],

        // Form label
        '.form-label': [
          'block text-sm font-medium text-text mb-2',
          'dark:text-text-inverse',
        ],

        '.form-hint': [
          'mt-1 text-xs text-gray-500 dark:text-gray-400',
        ],

        '.form-error': [
          'mt-1 text-xs text-error-500 dark:text-error-400',
        ],

        // Badge styles
        '.badge': [
          'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium',
        ],

        '.badge-primary': [
          '@apply badge bg-coral bg-opacity-10 text-coral dark:bg-coral-900 dark:text-coral-300',
        ],

        '.badge-success': [
          '@apply badge bg-success-50 text-success-700 dark:bg-success-900 dark:text-success-300',
        ],

        '.badge-warning': [
          '@apply badge bg-warning-50 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
        ],

        '.badge-error': [
          '@apply badge bg-error-50 text-error-700 dark:bg-error-900 dark:text-error-300',
        ],

        // Alert styles
        '.alert': [
          'px-4 py-3 rounded-lg border text-sm font-medium',
          'flex items-start gap-3',
        ],

        '.alert-success': [
          '@apply alert bg-success-50 border-success-300 text-success-800',
          'dark:bg-success-900 dark:border-success-700 dark:text-success-200',
        ],

        '.alert-warning': [
          '@apply alert bg-warning-50 border-warning-300 text-warning-800',
          'dark:bg-warning-900 dark:border-warning-700 dark:text-warning-200',
        ],

        '.alert-error': [
          '@apply alert bg-error-50 border-error-300 text-error-800',
          'dark:bg-error-900 dark:border-error-700 dark:text-error-200',
        ],

        '.alert-info': [
          '@apply alert bg-info-50 border-info-300 text-info-800',
          'dark:bg-info-900 dark:border-info-700 dark:text-info-200',
        ],

        // Responsive grid utilities
        '.grid-responsive': [
          '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        ],

        '.form-grid': [
          '@apply grid grid-cols-1 md:grid-cols-2 gap-4',
        ],

        '.sidebar-layout': [
          '@apply grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4',
        ],

        // Flexbox utilities
        '.flex-center': [
          '@apply flex items-center justify-center',
        ],

        '.flex-between': [
          '@apply flex items-center justify-between',
        ],

        // Text utilities
        '.text-truncate': [
          '@apply overflow-hidden text-ellipsis whitespace-nowrap',
        ],

        '.line-clamp-2': [
          '@apply overflow-hidden text-ellipsis',
          'display: -webkit-box',
          '-webkit-line-clamp: 2',
          '-webkit-box-orient: vertical',
        ],

        // Visibility utilities
        '.visually-hidden': [
          '@apply absolute w-px h-px p-0 m-[-1px] overflow-hidden',
          'clip-path: polygon(0 0, 0 0, 0 0)',
          'white-space: nowrap',
          'border-width: 0',
        ],
      });
    },

    // Dark mode specific plugin
    function({ addBase, theme }) {
      addBase({
        'html.dark': {
          'color-scheme': 'dark',
        },
        'html': {
          '@apply scroll-smooth': {},
        },
        'body': {
          '@apply bg-white text-text dark:bg-dark-bg-primary dark:text-text-inverse': {},
          'transition': 'background-color 0.3s, color 0.3s',
        },
      });
    },
  ],

  // Performance optimization
  corePlugins: {
    // Disable if not using
    // container: false,
  },

  // Variant order (respects dark mode)
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
    'dark',
  ],
};

/**
 * USAGE IN COMPONENTS:
 *
 * Light Mode (Default):
 * <div class="bg-white text-text shadow-md">
 *   <button class="btn-primary">Click me</button>
 * </div>
 *
 * Dark Mode (Add dark: prefix):
 * <div class="bg-white dark:bg-dark-bg-secondary text-text dark:text-text-inverse">
 *   <button class="btn-primary dark:btn-primary">Click me</button>
 * </div>
 *
 * Responsive (Mobile-first):
 * <div class="w-full md:w-1/2 lg:w-1/3">
 *   Responsive layout
 * </div>
 *
 * Custom animations:
 * <div class="animate-fade-in dark:animate-pulse">
 *   Animated content
 * </div>
 */
