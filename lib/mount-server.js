/* eslint no-console:0 */
const loadServerConfig = require('./load-server-config');
const { ApolloServer } = require('apollo-server-express');
const chalk = require('chalk');

function buildServer(directory, config = {}) {
  try {
    config = loadServerConfig(directory, config);
    return [new ApolloServer(config)];
  } catch (e) {
    return [null, e];
  }
}

function mountServer(app, { dir, cache, config, watcher, gui, path }) {
  let [server, error] = buildServer(dir, { gui, cache, ...config });

  if (error) {
    console.log(chalk.red('Error creating GraphQL server:'), error);
  } else {
    console.log(chalk.green('GraphQL server started on "' + path + '".'));
  }

  const handler = function() {
    [server, error] = buildServer(dir, { cache, ...config });
    if (error) {
      console.log(chalk.red('Error creating GraphQL server:'), error);
    } else {
      console.log(chalk.green('GraphQL server updated.'));
    }
  };
  watcher.on('change', handler);
  watcher.on('add', handler);
  watcher.on('delete', handler);

  const proxy = {
    set graphqlPath(path) {
      server.graphqlPath = path;
    },
    createGraphQLServerOptions(...args) {
      return server.createGraphQLServerOptions(...args);
    }
  };
  server.applyMiddleware.call(proxy, { app, path, gui });
}

module.exports = { mountServer, buildServer };
