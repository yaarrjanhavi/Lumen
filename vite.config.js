import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'copy-lumen-assets',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const items = ['js', 'fonts', 'sounds', 'styles', 'favicon.svg'];
        items.forEach(item => {
          const src = path.resolve(__dirname, item);
          const dest = path.resolve(distDir, item);
          if (fs.existsSync(src)) {
            try {
              fs.cpSync(src, dest, { recursive: true, force: true });
              console.log(`[Vite Plugin] Copied ${item} -> dist/${item}`);
            } catch (e) {
              console.warn(`[Vite Plugin] Failed to copy ${item}:`, e.message);
            }
          }
        });
      }
    }
  ]
});
