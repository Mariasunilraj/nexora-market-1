/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'none': '0px',
        'sm': '0px',
        'DEFAULT': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        '3xl': '0px',
        'full': '0px',
      },
      colors: {
        charcoal: {
          DEFAULT: '#18181B',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        electric: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        nexora: {
          dark: '#18181B',
          darker: '#09090B',
          card: '#27272A',
          border: '#3F3F46',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          lightBlue: '#2563EB',
          green: '#10B981',
          red: '#EF4444',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
