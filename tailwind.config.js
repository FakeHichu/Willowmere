/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './game/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        willow: {
          green: '#558b2f',
          darkgreen: '#33691e',
          lightgreen: '#c8e6c9',
          brown: '#8d6e63',
          darkbrown: '#5d4037',
          cream: '#f5f0e6',
          sand: '#d7ccc8',
        },
      },
    },
  },
  plugins: [],
};
