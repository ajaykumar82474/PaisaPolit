/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0B101E',
          850: '#10172B',
          800: '#16203B',
          750: '#1D2A4D',
          700: '#273863',
          600: '#3D5288',
        },
        brand: {
          lime: '#10E57A',
          limeHover: '#0CD36E',
          limeMuted: 'rgba(16, 229, 122, 0.12)',
          sim: '#7C3AED',
          simLight: '#9061F9',
          simMuted: 'rgba(124, 58, 237, 0.12)',
          amber: '#F59E0B',
          coral: '#EF4444',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-lime': '0 0 25px -5px rgba(16, 229, 122, 0.25)',
        'glow-sim': '0 0 25px -5px rgba(124, 58, 237, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
