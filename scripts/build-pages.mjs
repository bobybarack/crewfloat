import {copyFileSync, writeFileSync} from 'node:fs';
copyFileSync('cloudflare/pages.js', 'dist/_worker.js');
writeFileSync('dist/_routes.json', JSON.stringify({version: 1, include: ['/*'], exclude: []}));
