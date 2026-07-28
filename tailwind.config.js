/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'oit-black': '#000000',
        'oit-darkgray': '#121212',
        'oit-orange': '#FF5C00',
        'oit-darker': '#0a0a0a',
        'oit-card': '#18181b',
        'oit-border': '#27272a',
      },
    },
  },
  plugins: [],
};
