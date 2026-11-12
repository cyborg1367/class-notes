import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = await realpath(fileURLToPath(new URL('../../dist/', import.meta.url)));
const port = Number(process.env.E2E_PORT || 4174);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.webp':'image/webp', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf', '.wasm':'application/wasm', '.ico':'image/x-icon' };
const within = file => file === root || file.startsWith(root + path.sep);
const server = createServer(async (request,response) => {
  try {
    const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
    if (url.pathname === '/__browser_test_health') { response.writeHead(200,{'Content-Type':'text/plain'}).end('class-notes-browser-tests'); return; }
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root,'.' + pathname);
    if (!within(file) || pathname.includes('\\') || pathname.includes('\0')) { response.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(307,{Location:url.pathname+'/' + url.search}).end(); return; }
      file = path.join(file,'index.html');
    }
    if (!within(await realpath(file))) { response.writeHead(403).end(); return; }
    const body = await readFile(file);
    response.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-store'});
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch(error) { response.writeHead(error instanceof URIError ? 400 : error.code === 'ENOENT' ? 404 : 500).end(); }
});
server.listen(port,'127.0.0.1');
for (const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>server.close(()=>process.exit(0)));
