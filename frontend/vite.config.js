import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{js,jsx,ts,tsx}', // Process .js files as well
    })
  ],
  build: {
    outDir: 'build',
    sourcemap: false
  },
  resolve: {
    alias: {
      '@context': path.resolve(__dirname, './src/shared/context'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@modules': path.resolve(__dirname, './src/features/modules/'),
      '@images' : path.resolve(__dirname, './src/assets/images'),
      '@components': path.resolve(__dirname, './src/shared/components/'),
      '@admin' : path.resolve(__dirname, './src/admin/'),
      '@exceptions': path.resolve(__dirname, './src/exceptions/'),
      '@config': path.resolve(__dirname, './src/config/'),
      '@services': path.resolve(__dirname, './src/services/'),
      '@store': path.resolve(__dirname, './src/store/'),
      '@utils': path.resolve(__dirname, './src/utils/'),
    }
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  } 
})
