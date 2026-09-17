import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F2A44',
          50: '#EEF1F6',
          100: '#D7DDE9',
          200: '#AFBBD3',
          300: '#8799BD',
          400: '#5F77A7',
          500: '#3C4F78',
          600: '#1F2A44',
          700: '#192237',
          800: '#131A2A',
          900: '#0D111C',
        },
        status: {
          pago: '#16A34A',
          atencao: '#EAB308',
          atrasado: '#DC2626',
          inativo: '#6B7280',
        },
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
