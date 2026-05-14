class Router {
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

export default Router;