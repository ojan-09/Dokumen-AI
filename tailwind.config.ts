import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(0, 0, 0, 0.18)'
      },
      colors: {
        surface: '#0b1220',
        surface2: '#111827',
        surface3: '#17203a',
        border: '#2f384d',
        primary: '#7c3aed',
        accent: '#22d3ee'
      }
    }
  },
  plugins: [typography]
};

export default config;
