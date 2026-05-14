const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('Node.js Server Framework extension is now active!');

    // Command to create new project
    let createProject = vscode.commands.registerCommand('serverFramework.createProject', async (uri) => {
        const workspaceFolder = uri ? uri.fsPath : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }

        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            placeHolder: 'my-server-app'
        });

        if (!projectName) return;

        const projectPath = path.join(workspaceFolder, projectName);
        
        // Create project structure
        createProjectStructure(projectPath, projectName);
        
        vscode.window.showInformationMessage(`Server Framework project created at ${projectPath}`);
        
        // Open the project folder
        const openFolder = await vscode.window.showInformationMessage(
            'Open project folder?',
            'Yes', 'No'
        );
        
        if (openFolder === 'Yes') {
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
        }
    });

    // Command to add new route
    let addRoute = vscode.commands.registerCommand('serverFramework.addRoute', async () => {
        const method = await vscode.window.showQuickPick(
            ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            { placeHolder: 'Select HTTP method' }
        );
        
        if (!method) return;
        
        const routePath = await vscode.window.showInputBox({
            prompt: 'Enter route path',
            placeHolder: '/api/users/:id'
        });
        
        if (!routePath) return;
        
        const handlerName = routePath.replace(/\//g, '_').replace(/:/g, '') || 'handler';
        
        const snippet = `
app.${method.toLowerCase()}('${routePath}', (req, res) => {
    // TODO: Implement ${method} ${routePath} handler
    res.json({
        message: '${method} ${routePath} endpoint',
        params: req.params,
        query: req.query
    });
});`;
        
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, snippet);
            });
        } else {
            vscode.window.showInformationMessage('Open a JavaScript file to add the route');
        }
    });

    // Command to add middleware
    let addMiddleware = vscode.commands.registerCommand('serverFramework.addMiddleware', async () => {
        const middlewareType = await vscode.window.showQuickPick(
            ['Global Middleware', 'Route-specific Middleware'],
            { placeHolder: 'Select middleware type' }
        );
        
        let snippet = '';
        
        if (middlewareType === 'Global Middleware') {
            snippet = `
// Global middleware
app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.pathname} - \${new Date().toISOString()}\`);
    next();
});`;
        } else {
            const routePath = await vscode.window.showInputBox({
                prompt: 'Enter route path for middleware',
                placeHolder: '/api'
            });
            snippet = `
// Route-specific middleware for ${routePath}
app.use('${routePath}', (req, res, next) => {
    // Add your middleware logic here
    console.log('Middleware executed for ${routePath}');
    next();
});`;
        }
        
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, snippet);
            });
        } else {
            vscode.window.showInformationMessage('Open a JavaScript file to add the middleware');
        }
    });

    context.subscriptions.push(createProject, addRoute, addMiddleware);
}

function createProjectStructure(projectPath, projectName) {
    // Create directories
    const directories = ['lib', 'examples', 'public', 'static', 'routes', 'middleware'];
    directories.forEach(dir => {
        fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    });

    // Create package.json
    const packageJson = {
        name: projectName,
        version: "1.0.0",
        type: "module",
        description: "Node.js server application",
        main: "index.js",
        scripts: {
            "start": "node index.js",
            "dev": "node --watch index.js",
            "example": "node examples/basic-server.js"
        },
        keywords: ["server", "api", "nodejs"],
        author: "",
        license: "MIT"
    };
    
    fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    // Create index.js
    const indexJs = `import Server from './lib/Server.js';

const app = new Server();

// Middleware
app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.pathname}\`);
    next();
});

// Static files
app.static('/public', './public');
app.static('/static', './static');

// Routes
app.get('/', (req, res) => {
    res.html(\`
        <!DOCTYPE html>
        <html>
        <head>
            <title>\${projectName}</title>
        </head>
        <body>
            <h1>Welcome to \${projectName}</h1>
            <p>Server is running!</p>
        </body>
        </html>
    \`);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Server running at http://localhost:\${PORT}/\`);
});

export default app;`;
    
    fs.writeFileSync(path.join(projectPath, 'index.js'), indexJs);

    // Copy framework files
    const frameworkFiles = [
        'lib/Server.js',
        'lib/Request.js', 
        'lib/Response.js',
        'lib/Middleware.js',
        'lib/Router.js'
    ];
    
    frameworkFiles.forEach(file => {
        const content = getFrameworkFileContent(file);
        fs.writeFileSync(path.join(projectPath, file), content);
    });

    // Create example file
    const exampleJs = `import Server from '../index.js';

const app = new Server();

app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.pathname} - \${new Date().toISOString()}\`);
    next();
});

app.get('/', (req, res) => {
    res.html('<h1>Hello from Example Server!</h1>');
});

app.get('/api/users', (req, res) => {
    res.json({
        users: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
        ]
    });
});

app.listen(3000, 'localhost', () => {
    console.log('Example server running on http://localhost:3000');
});`;
    
    fs.writeFileSync(path.join(projectPath, 'examples', 'basic-server.js'), exampleJs);

    // Create README
    const readme = `# ${projectName}

A Node.js server application built with the custom Server Framework.

## Installation

\`\`\`bash
npm install
\`\`\`

## Running the Server

\`\`\`bash
npm start
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Example

\`\`\`bash
npm run example
\`\`\`

## API Endpoints

- GET / - Home page
- GET /api/health - Health check

## Features

- Routing with parameters
- Middleware support  
- Static file serving
- JSON/Form data parsing

## License

MIT
`;
    
    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

function getFrameworkFileContent(filename) {
    // Return the content of framework files
    const files = {
        'lib/Server.js': `import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import path from 'path';
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

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        await this.parseBody(request);
      } catch (error) {
        response.status(400).json({ error: 'Invalid request body' });
        return;
      }
    }

    try {
      await this.middleware.execute(request, response, async () => {
        const staticFile = await this.serveStatic(request.pathname);
        if (staticFile) {
          response.setHeader('Content-Type', staticFile.contentType);
          response.send(staticFile.content);
          return;
        }

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
        } catch (err) {}
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
      '.txt': 'text/plain'
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
        console.log(\`Server running at http://\${hostname}:\${port}/\`);
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

export default Server;`,
        'lib/Request.js': `class Request {
  constructor(req) {
    this.req = req;
    this.method = req.method;
    this.url = req.url;
    this.headers = req.headers;
    this.query = {};
    this.params = {};
    this.body = null;
    this.pathname = '';
  }

  get(header) {
    return this.headers[header.toLowerCase()];
  }

  isSecure() {
    return this.req.connection.encrypted;
  }

  getIp() {
    return this.req.headers['x-forwarded-for'] || 
           this.req.connection.remoteAddress;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }
}

export default Request;`,
        'lib/Response.js': `class Response {
  constructor(res) {
    this.res = res;
    this.headersSent = false;
  }

  status(code) {
    this.res.statusCode = code;
    return this;
  }

  setHeader(name, value) {
    this.res.setHeader(name, value);
    return this;
  }

  set(headers) {
    Object.entries(headers).forEach(([key, value]) => {
      this.res.setHeader(key, value);
    });
    return this;
  }

  send(data) {
    if (!this.headersSent) {
      if (data) {
        this.res.end(data);
      } else {
        this.res.end();
      }
      this.headersSent = true;
    }
  }

  json(data) {
    this.setHeader('Content-Type', 'application/json');
    this.send(JSON.stringify(data));
  }

  html(html) {
    this.setHeader('Content-Type', 'text/html');
    this.send(html);
  }

  text(text) {
    this.setHeader('Content-Type', 'text/plain');
    this.send(text);
  }

  redirect(url, status = 302) {
    this.status(status);
    this.setHeader('Location', url);
    this.send();
  }
}

export default Response;`,
        'lib/Middleware.js': `class Middleware {
  constructor() {
    this.middlewares = [];
  }

  add(route, handler) {
    this.middlewares.push({ route, handler });
  }

  async execute(request, response, next) {
    let index = 0;
    const middlewares = this.middlewares;

    const run = async (idx) => {
      if (idx >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[idx];
      
      if (middleware.route && !request.pathname.startsWith(middleware.route)) {
        return run(idx + 1);
      }

      try {
        await middleware.handler(request, response, () => run(idx + 1));
      } catch (error) {
        console.error('Middleware error:', error);
        if (!response.headersSent) {
          response.status(500).json({ error: 'Middleware Error' });
        }
      }
    };

    await run(index);
  }
}

export default Middleware;`,
        'lib/Router.js': `class Router {
  constructor() {
    this.routes = {
      GET: new Map(),
      POST: new Map(),
      PUT: new Map(),
      DELETE: new Map(),
      PATCH: new Map()
    };
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

  getRoutes() {
    return this.routes;
  }
}

export default Router;`
    };
    
    return files[filename] || '';
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};