import {copyFileSync, writeFileSync} from 'node:fs';
copyFileSync('cloudflare/pages.js', 'dist/_worker.js');
writeFileSync('dist/_routes.json', JSON.stringify({version: 1, include: ['/api/*'], exclude: []}));
writeFileSync('dist/_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin
  X-Frame-Options: DENY
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);
