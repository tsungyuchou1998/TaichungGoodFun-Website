import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncOfficialNews } from './news-sync.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = 4173;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const json = (response, status, value, extraHeaders = {}) => {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders,
  }).end(body);
};

const corsHeaders = (request) => {
  const origin = request.headers.origin || '';
  return /^http:\/\/(?:127\.0\.0\.1|localhost):(?:4173|5500)$/.test(origin)
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {};
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const cors = corsHeaders(request);

  if (pathname === '/api/news/sync' && request.method === 'OPTIONS') {
    response.writeHead(204, {
      ...cors,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
    }).end();
    return;
  }

  if (pathname === '/api/news/sync') {
    if (request.method !== 'POST') {
      json(response, 405, { message: 'Method Not Allowed' }, cors);
      return;
    }
    try {
      json(response, 200, await syncOfficialNews(), cors);
    } catch (error) {
      console.error('News sync failed:', error);
      json(response, 502, { message: `新聞同步失敗：${error.message}` }, cors);
    }
    return;
  }

  const relative = normalize(pathname).replace(/^([/\\])+/, '');
  let target = resolve(join(root, relative));
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if (statSync(target).isDirectory()) target = join(target, 'index.html');
    const stats = statSync(target);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-store',
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Public site: http://127.0.0.1:${port}/`);
  console.log(`Content manager: http://127.0.0.1:${port}/admin/`);
});
