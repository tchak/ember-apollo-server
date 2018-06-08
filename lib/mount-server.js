/* eslint no-console:0 */
const loadServerConfig = require('./load-server-config');
const { ApolloServer } = require('apollo-server');
const { graphqlExpress } = require('apollo-server-express');
const { default: gui } = require('graphql-playground-middleware-express');
const { json } = require('body-parser');
const accepts = require('accepts');
const chalk = require('chalk');

function buildServer(directory, config = {}) {
  try {
    config = loadServerConfig(directory, config);
    return [new ApolloServer(config)];
  } catch (e) {
    return [null, e];
  }
}

function mountServer(
  app,
  { dir, config, watcher, gui: mountGui, path = '/graphql' }
) {
  let [server, error] = buildServer(dir, config);

  if (error) {
    console.log(chalk.red('Error creating GraphQL server:'), error);
  } else {
    console.log(chalk.green('GraphQL server started.'));
  }

  const handler = function() {
    [server, error] = buildServer(dir, config);
    if (error) {
      console.log(chalk.red('Error creating GraphQL server:'), error);
    } else {
      console.log(chalk.green('GraphQL server updated.'));
    }
  };
  watcher.on('change', handler);
  watcher.on('add', handler);
  watcher.on('delete', handler);

  app.use(path, json(), (req, res, next) => {
    if (mountGui && req.method === 'GET') {
      const accept = accepts(req);
      const types = accept.types();

      if (prefersHTML(types)) {
        return gui({
          endpoint: path,
          subscriptionsEndpoint: server && server.subscriptionsPath
        })(req, res, next);
      }
    }
    return graphqlExpress((req, res) => {
      if (error) {
        res.statusCode = 400;
        res.send({ errors: [{ message: `${error}` }] });
      } else {
        return server.graphQLServerOptionsForRequest(req);
      }
    })(req, res, next);
  });
}

function prefersHTML(types) {
  return (
    types.find(x => x === 'text/html' || x === 'application/json') ===
    'text/html'
  );
}

module.exports = { mountServer, buildServer };
