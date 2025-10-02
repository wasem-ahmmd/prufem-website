/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors for Prufem
        brand: {
          black: '#000000',
          'gradient-black': '#1A1A1A',
          white: '#FFFFFF',
          gray: '#B0B0B0',
          emerald: '#50C878',
          'emerald-light': '#7FE5A3',
          'rose-gold': '#B76E79',
          'rose-gold-light': '#FFD2DC',
          'royal-purple': '#845EC2',
          'silver': '#E0E0E0',
          'silver-light': '#C0C0C0',
          'button-text': '#000000',
        },
      },
      backgroundImage: {
        'gradient-black': 'linear-gradient(180deg, #000000 0%, #1A1A1A 100%)',
        'gradient-emerald': 'linear-gradient(90deg, #50C878, #7FE5A3, #50C878)',
        'gradient-rose-gold': 'linear-gradient(90deg, #B76E79, #FFD2DC, #B76E79)',
        'gradient-silver': 'linear-gradient(90deg, #E0E0E0, #FFFFFF, #C0C0C0)',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(80,200,120,0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(80,200,120,0.4)' },
        },
      },
      boxShadow: {
        'emerald-glow': '0 0 15px rgba(80,200,120,0.4)',
        'rose-glow': '0 0 15px rgba(183,110,121,0.4)',
      },
    },
  },
  plugins: [],
}