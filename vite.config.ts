import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function apiDevServerPlugin(): Plugin {
  const ROUTE_MAP: Record<string, string> = {
    '/api/create-reservation': '/api/create-reservation.ts',
    '/api/guestbook': '/api/guestbook.ts',
    '/api/guestbook/count': '/api/guestbook/count.ts',
    '/api/guestbook/admin': '/api/guestbook/admin.ts',
  };

  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname.replace(/\/+$/, '');
        const modulePath = ROUTE_MAP[pathname];

        if (!modulePath) {
          return next();
        }

        try {
          // Populate req.query matching Vercel Serverless Functions
          const query: Record<string, string> = {};
          parsedUrl.searchParams.forEach((value, key) => {
            query[key] = value;
          });
          (req as any).query = query;

          // Read request body for non-GET/HEAD methods
          if (req.method && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            if (bodyStr) {
              try {
                (req as any).body = JSON.parse(bodyStr);
              } catch {
                (req as any).body = bodyStr;
              }
            } else {
              (req as any).body = {};
            }
          }

          const resObj = res as any;
          resObj.status = (code: number) => {
            res.statusCode = code;
            return resObj;
          };
          resObj.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return resObj;
          };

          const mod = await server.ssrLoadModule(modulePath);
          await mod.default(req, res);
        } catch (err: any) {
          console.error('API dev middleware error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
