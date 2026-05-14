# My Server Framework

A lightweight, Express-like Node.js server framework built from scratch.

## Features

- 🚀 Simple and intuitive API
- 🔄 Full middleware support
- 🧭 Powerful routing with parameters
- 📁 Static file serving
- 📦 JSON and form data parsing
- 🎯 Request/Response abstraction
- 🔌 Extensible architecture

## Installation

```bash
npm install my-server-framework
```

## Quick Start

```javascript
import Server from 'my-server-framework';

const app = new Server();

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.pathname}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.html('<h1>Hello World!</h1>');
});

app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John Doe' });
});

// Static files
app.static('/public', './public');

// Start server
app.listen(3000);
```

## API Documentation

### Server Methods

- `use(path?, handler)` - Add middleware
- `get(path, handler)` - Handle GET requests
- `post(path, handler)` - Handle POST requests
- `put(path, handler)` - Handle PUT requests
- `delete(path, handler)` - Handle DELETE requests
- `patch(path, handler)` - Handle PATCH requests
- `static(prefix, directory)` - Serve static files
- `listen(port, hostname, callback)` - Start the server

### Request Object

- `req.method` - HTTP method
- `req.url` - Request URL
- `req.headers` - Request headers
- `req.query` - Query parameters
- `req.params` - Route parameters
- `req.body` - Request body
- `req.get(header)` - Get header value

### Response Object

- `res.status(code)` - Set HTTP status code
- `res.setHeader(name, value)` - Set single header
- `res.set(headers)` - Set multiple headers
- `res.send(data)` - Send response
- `res.json(data)` - Send JSON response
- `res.html(html)` - Send HTML response
- `res.text(text)` - Send text response
- `res.redirect(url, status)` - Redirect

## Examples

Check the `/examples` directory for more usage examples.

## .gitignore

```
node_modules/
*.log
.DS_Store
dist/
coverage/
.env
public/
static/
```

## Setup

Create example directories:

```bash
mkdir -p examples public static
```

## License

MIT
