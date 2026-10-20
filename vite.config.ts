import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { GoogleGenAI } from '@google/genai';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'live-token-api-dev',
        configureServer(server) {
          server.middlewares.use('/api/live-token', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }));
              return;
            }
            try {
              const ai = new GoogleGenAI({ apiKey });
              const token = await ai.authTokens.create({ config: {} });
              res.statusCode = 200;
              res.end(JSON.stringify({ token: token.name }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to create token' }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
