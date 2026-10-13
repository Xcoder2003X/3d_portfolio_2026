import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0b1120',
        accent: '#7dd3fc',
      },
      boxShadow: {
        glow: '0 0 30px rgba(125, 211, 252, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
