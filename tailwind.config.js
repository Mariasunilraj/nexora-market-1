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
        nexora: {
          dark: '#0B132B',
          darker: '#070D1F',
          card: '#111C3A',
          border: '#1C2951',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          teal: '#00F2FE',
          green: '#10B981',
          red: '#EF4444',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
