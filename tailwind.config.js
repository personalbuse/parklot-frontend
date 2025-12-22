/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22D3EE',
          50: '#E0FAFE',
          100: '#B8F3FB',
          200: '#7FE8F7',
          300: '#46DDF3',
          400: '#22D3EE',
          500: '#0CBED9',
          600: '#0A9BB0',
          700: '#087888',
          800: '#06555F',
          900: '#043237'
        },
        accent: {
          DEFAULT: '#F97316',
          50: '#FEF3E8',
          100: '#FDE4CC',
          200: '#FBC694',
          300: '#FAA85C',
          400: '#F97316',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407'
        },
        dark: {
          DEFAULT: '#0F172A',
          50: '#475569',
          100: '#334155',
          200: '#1E293B',
          300: '#0F172A',
          400: '#0B1222',
          500: '#080D19',
          600: '#050911',
          700: '#030508',
          800: '#010203',
          900: '#000000'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #22D3EE, 0 0 10px #22D3EE' },
          '100%': { boxShadow: '0 0 20px #22D3EE, 0 0 30px #22D3EE' }
        }
      }
    },
  },
  plugins: [],
}
