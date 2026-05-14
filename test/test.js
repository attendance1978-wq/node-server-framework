import { describe, it } from 'node:test';
import assert from 'node:assert';
import Server from '../lib/Server.js';

describe('Server Framework Tests', () => {
  it('should create server instance', () => {
    const app = new Server();
    assert.ok(app);
    assert.strictEqual(typeof app.get, 'function');
    assert.strictEqual(typeof app.post, 'function');
    assert.strictEqual(typeof app.use, 'function');
  });

  it('should register routes', () => {
    const app = new Server();
    app.get('/test', (req, res) => {});
    assert.strictEqual(app.routes.GET.has('/test'), true);
  });

  it('should match route parameters', () => {
    const app = new Server();
    const params = app.matchPath('/users/:id', '/users/123');
    assert.deepStrictEqual(params, { id: '123' });
  });

  it('should handle static file serving', () => {
    const app = new Server();
    app.static('/public', './public');
    assert.strictEqual(app.staticPaths.length, 1);
  });
});
