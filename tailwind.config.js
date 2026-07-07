/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 例如自定义的透明黑色
        "latex":      'rgba( 0, 128, 128, 1.0)',
        "three":      'rgba(24, 209,  20, 1.0)',//
        "three-300":  'rgba(24, 209,  30, 1.0)',// 24,209,18
        "cesium":     'rgba(94, 166, 209, 1.0)', // 94,166,209
        "cesium-300": 'rgba(94, 166, 229, 1.0)', // 94,166,229
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'gradient-bg': 'gradient 6s ease infinite', // 动态渐变动画
      },
    },
  },
  plugins: [],
};
