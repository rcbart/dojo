// Zero-dependency static file server for the built Dev Dojo site (dist/).
//
// Kept dependency-free on purpose: the repo ships no runtime deps, and the
// Playwright config points its `webServer` at this so CI serves exactly the
// bytes `node build.js` produced. Explicit .mjs so it does not depend on the
// package.json "type" (the repo's other scripts are CommonJS).
//
// Env:
//   PORT   port to listen on (default 4321)
//   ROOT   directory to serve (default ./dist)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..');
const ROOT = path.resolve(REPO, process.env.ROOT || 'dist');
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    // Strip query/hash, decode, and refuse path traversal out of ROOT.
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    let filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }
    if (!info) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    const body = await readFile(filePath);
    const type = TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Server error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`serving ${ROOT} at http://localhost:${PORT}/`);
});
