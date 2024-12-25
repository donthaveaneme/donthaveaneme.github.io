/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',

  content: [
    "./index.html",
    "./point.html",   // Tambahkan file baru di sini jika perlu
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
