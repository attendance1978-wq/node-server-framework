import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import path from 'path';
import { parse as parseQuery } from 'querystring';
import Request from './Request.js';
import Response from './Response.js';
import Middleware from './Middleware.js';

class Server {
  constructor() {
    this.middleware = new Middleware();
    this.routes = {
      GET: new Map(),
      POST: new Map(),
      PUT: new Map(),
      DELETE: new Map(),
      PATCH: new Map()
    };
    this.staticPaths = [];
    this.server = null;
  }

  use(route, handler) {
    if (typeof route === 'function') {
      handler = route;
      route = null;
    }
    this.middleware.add(route, handler);
    return this;
  }

  get(path, handler) {
    this.routes.GET.set(path, handler);
    return this;
  }

  post(path, handler) {
    this.routes.POST.set(path, handler);
    return this;
  }

  put(path, handler) {
    this.routes.PUT.set(path, handler);
    return this;
  }

  delete(path, handler) {
    this.routes.DELETE.set(path, handler);
    return this;
  }

  patch(path, handler) {
    this.routes.PATCH.set(path, handler);
    return this;
  }

  static(prefix, directory) {
    this.staticPaths.push({ prefix, directory: path.resolve(directory) });
    return this;
  }

  async handleRequest(req, res) {
    const request = new Request(req);
    const response = new Response(res);
    
    const parsedUrl = url.parse(request.url, true);
    request.query = parsedUrl.query;
    request.pathname = parsedUrl.pathname;
    request.params = {};

    // Parse body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        await this.parseBody(request);
      } catch (error) {
        response.status(400).json({ error: 'Invalid request body' });
        return;
      }
    }

    try {
      // Execute middleware chain
      await this.middleware.execute(request, response, async () => {
        // Check static files first
        const staticFile = await this.serveStatic(request.pathname);
        if (staticFile) {
          response.setHeader('Content-Type', staticFile.contentType);
          response.send(staticFile.content);
          return;
        }

        // Route handling
        const routeHandler = this.matchRoute(request.method, request.pathname);
        if (routeHandler) {
          request.params = routeHandler.params;
          await routeHandler.handler(request, response);
        } else {
          response.status(404).json({ error: 'Not Found' });
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      if (!response.headersSent) {
        response.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  matchRoute(method, pathname) {
    const routes = this.routes[method];
    if (!routes) return null;

    for (const [routePath, handler] of routes) {
      const params = this.matchPath(routePath, pathname);
      if (params !== null) {
        return { handler, params };
      }
    }
    return null;
  }

  matchPath(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    if (routeParts.length !== actualParts.length) return null;
    
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }
    return params;
  }

  async parseBody(request) {
    const contentType = request.headers['content-type'];
    
    const body = await new Promise((resolve, reject) => {
      let data = '';
      request.req.on('data', chunk => data += chunk);
      request.req.on('end', () => resolve(data));
      request.req.on('error', reject);
    });

    if (contentType && contentType.includes('application/json')) {
      try {
        request.body = JSON.parse(body);
      } catch (e) {
        throw new Error('Invalid JSON');
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
      const querystring = await import('querystring');
      request.body = querystring.parse(body);
    } else {
      request.body = body;
    }
  }

  async serveStatic(pathname) {
    for (const staticPath of this.staticPaths) {
      if (pathname.startsWith(staticPath.prefix)) {
        const relativePath = pathname.slice(staticPath.prefix.length);
        const filePath = path.join(staticPath.directory, relativePath);
        
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            const content = await fs.readFile(filePath);
            const ext = path.extname(filePath);
            const contentType = this.getContentType(ext);
            return { content, contentType };
          }
        } catch (err) {
          // File doesn't exist, continue to next static path
        }
      }
    }
    return null;
  }

  getContentType(ext) {
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf'
    };
    return types[ext] || 'application/octet-stream';
  }

  listen(port, hostname = 'localhost', callback) {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(port, hostname, () => {
      if (callback) {
        callback();
      } else {
        console.log(`Server running at http://${hostname}:${port}/`);
      }
    });

    return this;
  }

  close(callback) {
    if (this.server) {
      this.server.close(callback);
    }
  }
}

export default Server;