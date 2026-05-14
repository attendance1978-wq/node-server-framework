class Request {
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

export default Request;