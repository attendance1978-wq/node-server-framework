class Middleware {
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
      
      // Check if middleware applies to this route
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

export default Middleware;