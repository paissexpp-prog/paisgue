import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from 'vite-plugin-prerender'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/'],
      renderer: new prerender.PuppeteerRenderer({
        renderAfterTime: 3000,
        headless: true,
      }),
    }),
  ],
})
