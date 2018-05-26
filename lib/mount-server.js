const { ApolloServer, gql } = require('apollo-server');
const { registerServer } = require('apollo-server-express');
const { sync: globSync } = require('glob');
const { readFileSync } = require('fs');
const ServerProxy = require('./server-proxy');
const esm = require('esm');

function readTypeFile(path) {
  let content = readFileSync(path, { encoding: 'utf-8' });
  return gql`
    ${content}
  `;
}

function requireFile(require, path) {
  let filename = globSync(`${path}.?(js|mjs)`)[0];
  let mod = filename ? require(filename) : null;
  return mod ? mod.default : null;
}

function buildServer(directory, config = {}) {
  const typeDefs = globSync(`${directory}/types/**/*.?(graphql|gql)`).map(
    readTypeFile
  );
  const require = esm(module);
  const resolvers = requireFile(require, `${directory}/resolvers`);
  const mocks =
    config.mocks === false
      ? config.mocks
      : requireFile(require, `${directory}/mocks`) || config.mocks || false;

  try {
    return new ApolloServer({
      typeDefs,
      resolvers,
      mocks
    });
  } catch (e) {
    return false;
  }
}

function mountServer(app, { dir, config, watcher }) {
  let server = buildServer(dir, config);
  let serverProxy = server ? new ServerProxy(server) : null;

  if (serverProxy) {
    registerServer({ server: serverProxy, app });
  }

  watcher.on('change', () => {
    let server = buildServer(dir, config);
    if (server) {
      if (serverProxy) {
        serverProxy.reload(server);
      } else {
        serverProxy = new ServerProxy(server);
        registerServer({ server: serverProxy, app });
      }
    }
  });
}

module.exports = mountServer;
