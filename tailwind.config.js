/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',

  content: [
    "./index.html",
    "./point.html",
    "./camera-qr.html",
    "./camera-qr-copy.html",
    "./**/*.html",    // Ini akan mencakup semua file HTML di subfolder
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand'], // Menambahkan font kustom di sini
      },
    },
  },
  plugins: [],
};
