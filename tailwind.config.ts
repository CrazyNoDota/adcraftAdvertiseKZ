import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b6d4ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0b2447',
        },
        ink: '#0a0a14',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif'],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,15px) scale(0.97)' },
        },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        blob: 'blob 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
