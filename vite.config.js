import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [react()],
  // 👉 to jest właściwe miejsce na base
  base: process.env.VITE_BASE_PATH ?? '/',
  // (opcjonalnie) jeśli jakieś paczki oczekują `global`:
  define: {
    global: 'globalThis',
  },
})