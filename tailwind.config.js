/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        cream: {
          50: '#FFFEFA',
          100: '#FFFDF6',
          200: '#FFF8E7', // Warm Cream primary
          300: '#FAF0D6',
          400: '#F4E4BD',
          500: '#EBD19B',
        },
        saffron: {
          50: '#FDF7EE',
          100: '#FDF0DD',
          200: '#FADCB4',
          300: '#F5C282',
          400: '#EEA24B',
          500: '#E98B2A', // Saffron primary
          600: '#D37616', // Saffron hover
          700: '#B05E12',
          800: '#8D4915',
          900: '#733E16',
          950: '#3E1D08',
        },
        gold: {
          50: '#FEFDF6',
          100: '#FDFBE7',
          200: '#FAF4C4',
          300: '#F4E794',
          400: '#E8D252',
          500: '#D4A017', // Wisdom Gold primary
          600: '#B88210',
          700: '#92600F',
          800: '#794C14',
          900: '#673F16',
          950: '#3C2007',
        },
        brown: {
          50: '#FBF9F7',
          100: '#F4EFEA',
          200: '#E6DDD4',
          300: '#D2C2B2',
          400: '#BAA28E',
          500: '#9C816C',
          600: '#7D6451',
          700: '#5F4A3B',
          800: '#4A3525', // Deep Brown primary
          900: '#382619',
          950: '#261910',
        },
        // School theme mapping: buttons & highlights -> saffron, text & headings -> deep brown, backgrounds -> cream/white
        school: {
          50: '#FFF8E7',  // Warm Cream
          100: '#FDF0DD', // Soft Saffron Cream
          200: '#EBDDCB', // Warm Border
          300: '#F5C282',
          400: '#EEA24B',
          500: '#E98B2A', // Sacred Saffron
          600: '#D37616', // Saffron Hover
          700: '#E98B2A', // Saffron Primary
          800: '#4A3525', // Deep Brown
          900: '#382619', // Deep Dark Brown
          950: '#261910', // Deepest Dark Brown
        },
        surface: {
          pure: '#FFFFFF',
          subtle: '#FFF8E7',
          card: '#FFFFFF',
          border: '#EBDDCB',
          borderHover: '#D4A017',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Merriweather"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(74, 53, 37, 0.05), 0 1px 2px -1px rgba(74, 53, 37, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(74, 53, 37, 0.06), 0 2px 4px -2px rgba(74, 53, 37, 0.05)',
        'soft-lg': '0 10px 15px -3px rgba(74, 53, 37, 0.08), 0 4px 6px -4px rgba(74, 53, 37, 0.04)',
        'soft-xl': '0 20px 25px -5px rgba(74, 53, 37, 0.08), 0 8px 10px -6px rgba(74, 53, 37, 0.03)',
        'card-hover': '0 14px 28px -4px rgba(74, 53, 37, 0.1), 0 10px 10px -5px rgba(212, 160, 23, 0.08)',
        'header': '0 4px 20px -2px rgba(74, 53, 37, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
