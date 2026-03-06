/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#0d0d14',
        card: '#1e1e2e',
        accent: '#7c6af7',
      },
      fontFamily: {
        heading: ['Syne', 'system-ui', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
}

