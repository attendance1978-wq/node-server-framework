import Server from '../index.js';

const app = new Server();

// Logger middleware
app.use(async (req, res, next) => {
  console.log(`${req.method} ${req.pathname} - ${new Date().toISOString()}`);
  next();
});

// Authentication middleware for API routes
app.use('/api', async (req, res, next) => {
  const authToken = req.getHeader('authorization');
  if (!authToken || authToken !== 'Bearer secret-token-123') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// Static file serving
app.static('/public', './public');
app.static('/static', './static');

// Routes
app.get('/', (req, res) => {
  res.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Server Framework</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>🚀 Welcome to My Server Framework!</h1>
      <p>A lightweight, Express-like framework built from scratch</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><a href="/api/users">GET /api/users</a> - Get all users</li>
        <li><a href="/api/users/1">GET /api/users/:id</a> - Get user by ID</li>
        <li><code>POST /api/users</code> - Create new user</li>
        <li><code>PUT /api/users/1</code> - Update user</li>
        <li><code>DELETE /api/users/1</code> - Delete user</li>
      </ul>
      
      <h2>Features:</h2>
      <ul>
        <li>✅ Routing with parameters</li>
        <li>✅ Middleware support</li>
        <li>✅ Static file serving</li>
        <li>✅ JSON/Form data parsing</li>
        <li>✅ Request/Response abstraction</li>
      </ul>
    </body>
    </html>
  `);
});

// API routes
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  res.json({
    success: true,
    data: users,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const users = {
    1: { id: 1, name: 'John Doe', email: 'john@example.com' },
    2: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    3: { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  };
  
  const user = users[userId];
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ success: false, error: 'Name and email are required' });
    return;
  }
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { id: Date.now(), name, email }
  });
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  
  res.json({
    success: true,
    message: `User ${userId} updated successfully`,
    data: updates
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  res.json({
    success: true,
    message: `User ${userId} deleted successfully`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 Server Framework Started!        ║
  ╠═══════════════════════════════════════╣
  ║   URL: http://localhost:${PORT}         ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}        ║
  ╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});