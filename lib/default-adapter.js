const fetch = require('node-fetch');

class DefaultAdapter {
  get fetch() {
    return fetch;
  }
}

module.exports = DefaultAdapter;
