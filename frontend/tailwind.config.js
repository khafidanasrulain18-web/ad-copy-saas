/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FAFAF8',
        surface: '#FFFFFF',
        'surface-hover': '#F3F3EE',
        border: '#E6E5DF',
        ink: '#16160F',
        'ink-soft': '#6E6D64',
        gold: '#B8722A',
        'gold-dim': '#8F5A1F',
        teal: '#2F8F86',
        alert: '#D6472F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};