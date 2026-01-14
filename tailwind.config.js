/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // ... (biarkan bagian extend dan lainnya seperti semula)
    extend: {
      // Pastikan konfigurasi font dan animasi Anda masih ada di sini
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      // --- TAMBAHAN ANIMASI BARU ---
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out', // Diperlambat sedikit biar smooth
        'slide-up': 'slideUp 0.8s ease-out',
        'gradient-slow': 'gradient 15s ease infinite', // Background bergerak lambat
        'float-slow': 'float 20s ease-in-out infinite alternate', // Blob mengambang
        'float-slower': 'floatReverse 25s ease-in-out infinite alternate', // Blob satunya lebih lambat
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
        // Keyframe untuk background bergerak
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Keyframe untuk blob mengambang
        float: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '100%': { transform: 'translate(-10px, 10px) scale(0.95)' },
        },
        floatReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(1.1)' },
          '100%': { transform: 'translate(10px, -10px) scale(0.9)' },
        },
      }
      // --- AKHIR TAMBAHAN ---
    },
  },
  plugins: [],
};