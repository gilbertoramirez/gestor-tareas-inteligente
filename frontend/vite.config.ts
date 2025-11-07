import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('>>> ESTE ES EL VITE.CONFIG.JS NUEVO Y SE ESTÁ USANDO <<<')

export default defineConfig({
  plugins: [react()],
  server: {
    // aceptamos cualquier host externo (ngrok cambiante)
    allowedHosts: true,
    host: true,
    port: 5173,
    cors: true, // opcionalmente relajamos CORS para que no frene peticiones desde ngrok
  },
})
