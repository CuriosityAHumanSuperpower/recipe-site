import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ("./") makes the build work when hosted at
// https://<user>.github.io/<repo>/ without having to hardcode the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
})
