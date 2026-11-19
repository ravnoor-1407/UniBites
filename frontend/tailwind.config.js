/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7A1F3D',
          hover: '#5E1730',
        },
        accent: {
          DEFAULT: '#E3A82B',
          hover: '#C98F1A',
        },
        cream: {
          DEFAULT: '#FBF6EC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F3EBDD',
        },
        text: {
          DEFAULT: '#2B1B1F',
          muted: '#6B5A5E',
        },
        border: {
          DEFAULT: '#E7DCC8',
        },
        success: {
          DEFAULT: '#2E7D4F',
        },
        warning: {
          DEFAULT: '#D98A00',
        },
        danger: {
          DEFAULT: '#C62828',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(43, 27, 31, 0.05)',
        card: '0 4px 16px rgba(43, 27, 31, 0.06)',
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
