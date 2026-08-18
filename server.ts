import { Cache } from './src/cache'
import { healthCheck } from './src/routes/health'
import { handler as rawHandler } from './src/routes/v1/raw/[id]'
import { handler as renderHandler } from './src/routes/v1/render/[id]'

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const jsonCache = new Cache<string>(1000); // 1000 items; default 10min TTL
const htmlCache = new Cache<string>(1000); // 1000 items; default 10min TTL
setInterval(() => { jsonCache.cleanup(); htmlCache.cleanup(); }, 10 * 60 * 1000); // 10min

const routeHandlers: Record<string, (req: Request) => Promise<Response>> = Object.freeze({
  raw: rawHandler,
  render: renderHandler,
});

// checks for /v1/{raw or render}/{uuid}
const pathValidationRegex = /^\/v[1-9]\d*\/(raw|render)\/.+$/;

const server = Bun.serve({
  port: Number(PORT),
  hostname: HOST,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === '/health') return healthCheck();
    if (!pathValidationRegex.test(pathname)) {
      return new Response('invalid request', { status: 400 });
    }

    const routeType = pathname.split('/')[3];
    const cache = routeType === 'render' ? htmlCache : jsonCache;

    const headers: Record<string, string> = {};
    const { etag, lastModified } = cache.getMetadata(pathname) || {};

    const cached = cache.get(pathname);
    if (cached) {
      headers['Content-Type'] = routeType === 'render' ? 'text/html; charset=utf-8' : 'application/json';
      headers['Cache-Control'] = 'public, max-age=600'; // 10 minutes
      headers['ETag'] = etag || '';
      headers['Last-Modified'] = lastModified ? new Date(lastModified).toUTCString() : '';

      if (req.headers.get('If-None-Match') === etag) {
        return new Response(null, { status: 304, headers });
      }
      const ifModifiedSince = req.headers.get('If-Modified-Since');
      if ((ifModifiedSince && lastModified) && new Date(ifModifiedSince).getTime() >= lastModified) {
        return new Response(null, { status: 304, headers });
      }
      return new Response(cached, { headers });
    }

    const handler = routeHandlers[routeType];
    if (!handler) {
      return new Response('invalid request', { status: 400 });
    }

    const res = await handler(req);
    const body = await res.text();
    cache.set(pathname, body);

    headers['Cache-Control'] = 'public, max-age=600'; // 10 minutes
    if (etag) headers['ETag'] = etag;
    if (lastModified) headers['Last-Modified'] = new Date(lastModified).toUTCString();

    return new Response(body, { status: res.status, headers });
  },
});

console.log(`Server running at http://${HOST}:${PORT}`);
