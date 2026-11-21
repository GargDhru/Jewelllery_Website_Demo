/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5EEDD',
          300: '#EDE2C8',
          400: '#E2D1AB',
          500: '#D5BE8A',
        },
        ivory: {
          DEFAULT: '#FFFFF4',
          warm: '#FDFCF7',
          soft: '#F8F6F0',
        },
        gold: {
          50: '#FDFBF0',
          100: '#FBF5DC',
          200: '#F5E6B0',
          300: '#EED380',
          400: '#E4BF54',
          500: '#D4AF37', // Champagne / Artisan Gold
          600: '#B89228',
          700: '#95711C',
          800: '#7A5B1B',
          900: '#664C1B',
        },
        champagne: {
          DEFAULT: '#E8D8C8',
          light: '#F4ECE4',
          dark: '#C8B097',
        },
        rose: {
          50: '#FDF6F5',
          100: '#F9ECE9',
          200: '#F3D6D2',
          300: '#EAB9B2',
          400: '#DC968C',
          500: '#CB7468',
        },
        onyx: {
          800: '#2A2421',
          900: '#1A1715',
          950: '#110F0E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        display: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(184, 146, 40, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(184, 146, 40, 0.22), 0 8px 20px rgba(0, 0, 0, 0.06)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

