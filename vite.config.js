import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePrerender } from 'vite-plugin-prerender'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePrerender({
      // Folder hasil build Vite (default: dist)
      staticDir: path.join(__dirname, 'dist'),

      // Hanya render halaman publik yang bisa diakses tanpa login
      // Jangan masukkan /dashboard, /order, dll karena butuh token
      routes: ['/'],

      renderer: new (await import('vite-plugin-prerender')).PuppeteerRenderer({
        // Tunggu sampai React selesai render konten
        renderAfterTime: 3000,

        // Headless browser tidak perlu buka window
        headless: true,
      }),
    }),
  ],
})
