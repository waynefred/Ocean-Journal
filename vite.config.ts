import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load ALL environment variables (including GEMINI_API_KEY from Netlify/env)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expose Netlify environment variables to the client-side code.
      // This is crucial for the live site to connect to Supabase and other services.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      // Prevent 'process is not defined' errors for other cases
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