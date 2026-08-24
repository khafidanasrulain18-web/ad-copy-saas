/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0E0F12',
        surface: '#17181C',
        'surface-hover': '#1F2025',
        border: '#2A2B31',
        ink: '#F2F1ED',
        'ink-soft': '#9A9A96',
        gold: '#E3A854',
        'gold-dim': '#B5854A',
        teal: '#5FA8A0',
        alert: '#E8604C',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};