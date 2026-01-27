import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Copia o worker do PDF.js para a pasta public durante o build
try {
  const workerSource = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
  const workerDest = join(process.cwd(), 'public', 'pdf.worker.min.mjs');
  copyFileSync(workerSource, workerDest);
} catch (e) {
  // Ignora erro se o arquivo já existir ou não for encontrado
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
