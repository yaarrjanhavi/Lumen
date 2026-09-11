const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const items = ['js', 'fonts', 'sounds', 'styles', 'favicon.svg', 'assests', 'assets'];

items.forEach(item => {
  const src = path.resolve(__dirname, item);
  const dest = path.resolve(distDir, item);
  if (fs.existsSync(src)) {
    try {
      fs.cpSync(src, dest, { recursive: true, force: true });
      console.log(`[Lumen Build] Copied ${item} -> dist/${item}`);
    } catch (err) {
      console.warn(`[Lumen Build] Warning copying ${item}:`, err.message);
    }
  }
});
