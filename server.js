'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { getStats, startSampling } = require('./lib/metrics');
const { renderPage } = require('./lib/page');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = (() => {
  const dir = path.join(__dirname, 'public');
  try {
    return fs.realpathSync(dir);
  } catch {
    return dir;
  }
})();
const O_NOFOLLOW = fs.constants.O_NOFOLLOW || 0;
const STATIC_MAX_AGE = 86400;

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'"
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function send(req, res, status, headers, body) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers, 'Content-Length': buf.length });
  res.end(req.method === 'HEAD' ? undefined : buf);
}

const sendJson = (req, res, status, obj, headers = {}) =>
  send(req, res, status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }, JSON.stringify(obj));

const sendText = (req, res, status, text, headers = {}) =>
  send(req, res, status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers }, text);

const notFound = (req, res) => sendText(req, res, 404, 'Não encontrado');

function serverError(req, res) {
  if (res.headersSent) return res.destroy();
  sendJson(req, res, 500, { error: 'Erro interno do servidor' });
}

function resolveStatic(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const full = path.resolve(PUBLIC_DIR, '.' + decoded);
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + path.sep)) return null;
  return full;
}

function serveStatic(req, res, pathname) {
  const file = resolveStatic(pathname);
  if (!file) return notFound(req, res);

  fs.realpath(file, (err, real) => {
    if (err || real !== file || !real.startsWith(PUBLIC_DIR + path.sep)) return notFound(req, res);

    fs.lstat(real, (err, before) => {
      if (err || !before.isFile()) return notFound(req, res);

      fs.open(real, fs.constants.O_RDONLY | O_NOFOLLOW, (err, fd) => {
        if (err) return notFound(req, res);

        fs.fstat(fd, (err, st) => {
          if (err || !st.isFile() || st.dev !== before.dev || st.ino !== before.ino) {
            fs.close(fd, () => {});
            return notFound(req, res);
          }

          const type = MIME[path.extname(real).toLowerCase()] || 'application/octet-stream';
          const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
          const headers = {
            ...SECURITY_HEADERS,
            'Content-Type': type,
            'Cache-Control': `public, max-age=${STATIC_MAX_AGE}`,
            'Last-Modified': st.mtime.toUTCString(),
            ETag: etag
          };

          if (req.headers['if-none-match'] === etag) {
            fs.close(fd, () => {});
            res.writeHead(304, headers);
            return res.end();
          }

          headers['Content-Length'] = st.size;
          res.writeHead(200, headers);
          if (req.method === 'HEAD') {
            fs.close(fd, () => {});
            return res.end();
          }

          const stream = fs.createReadStream(null, { fd });
          stream.on('error', (e) => {
            console.error(e);
            res.destroy();
          });
          res.on('close', () => stream.destroy());
          stream.pipe(res);
        });
      });
    });
  });
}

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(req, res, 405, 'Método não permitido', { Allow: 'GET, HEAD' });
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    return sendText(req, res, 400, 'Requisição inválida');
  }

  if (pathname === '/api/stats') {
    return sendJson(req, res, 200, getStats(), { 'Cache-Control': 'no-store' });
  }
  if (pathname === '/healthz') {
    return sendJson(req, res, 200, { status: 'ok' });
  }
  if (pathname === '/') {
    return send(
      req, res, 200,
      { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      renderPage(getStats())
    );
  }
  return serveStatic(req, res, pathname);
}

const server = http.createServer((req, res) => {
  try {
    handle(req, res);
  } catch (err) {
    console.error(err);
    serverError(req, res);
  }
});

server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

startSampling();

server.listen(PORT, HOST, () => {
  console.log(`System Monitor rodando na porta ${PORT}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} recebido, encerrando…`);
  server.close(() => process.exit(0));
  if (server.closeIdleConnections) server.closeIdleConnections();
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
