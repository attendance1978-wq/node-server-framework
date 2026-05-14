class Response {
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

export default Response;