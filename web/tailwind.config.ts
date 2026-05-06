import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        gray: {
          950: '#030712',
          900: '#111827',
          850: '#161e2e',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      opacity: {
        '8': '0.08',
      },
    },
  },
  plugins: [],
} satisfies Config;
