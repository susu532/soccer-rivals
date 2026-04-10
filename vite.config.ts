/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {viteObfuscateFile} from 'vite-plugin-obfuscator';

export default defineConfig(({mode}) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Obfuscate JS in production builds to prevent code theft
      ...(isProd
        ? [
            viteObfuscateFile({
              options: {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.5,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.2,
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false,
                selfDefending: true,
                stringArray: true,
                stringArrayEncoding: ['base64'],
                stringArrayThreshold: 0.75,
                transformObjectKeys: true,
                unicodeEscapeSequence: false,
                disableConsoleOutput: false,
              },
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Strip debugger statements in production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_debugger: true,
        },
        format: {
          comments: false, // Strip all comments from output
        },
      },
      // Randomize chunk names to make structure harder to follow
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          entryFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
        },
      },
    },
  };
});

/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
