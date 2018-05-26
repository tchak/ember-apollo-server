class ServerProxy {
  constructor(server) {
    this._server = server;
  }

  request() {
    return this._server.request(...arguments);
  }

  use() {
    return this._server.use(...arguments);
  }

  get subscriptionsPath() {
    return this._server.subscriptionsPath;
  }

  get disableTools() {
    return this._server.disableTools;
  }

  reload(server) {
    server.use({
      getHttp: this._server.getHttp,
      path: this._server.graphqlPath
    });
    this._server = server;
  }
}

module.exports = ServerProxy;
