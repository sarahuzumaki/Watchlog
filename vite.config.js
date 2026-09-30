import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sur GitHub Pages, le site vit dans le sous-dossier /Watchlog/
  // (https://sarahuzumaki.github.io/Watchlog/)
  base: '/Watchlog/',
})
