import { mkdirSync, writeFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/** Dev-only endpoint used by src/core/snapshots.ts to save model pictures. */
const saveSnapshots: Plugin = {
  name: 'save-snapshots',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__snapshot', (req, res) => {
      const name = new URL(req.url ?? '', 'http://local').searchParams.get('name') ?? '';
      if (req.method !== 'POST' || !/^[a-z-]+$/.test(name)) {
        res.statusCode = 400;
        return res.end();
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const data = body.replace(/^data:image\/webp;base64,/, '');
        mkdirSync('public/snapshots', { recursive: true });
        writeFileSync(`public/snapshots/${name}.webp`, Buffer.from(data, 'base64'));
        res.end('saved');
      });
    });
  },
};

export default defineConfig({
  // Relative paths so the build works on GitHub Pages under any repository name.
  base: './',
  plugins: [saveSnapshots],
  server: { port: 5173 },
  build: { chunkSizeWarningLimit: 800 },
});
