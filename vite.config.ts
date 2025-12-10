import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load ALL environment variables (including GEMINI_API_KEY from Netlify/env)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: Defines the Netlify variable (GEMINI_API_KEY) as the app's expected variable (API_KEY).
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      // Prevent 'process is not defined' errors
      'process.env': {}, 
    },
    base: '/',
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      sourcemap: false,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      }
    },
  };
});
