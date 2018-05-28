/* eslint no-console:0 */
const { ApolloServer, gql } = require('apollo-server');
const { graphqlExpress } = require('apollo-server-express');
const { default: gui } = require('graphql-playground-middleware-express');
const { json } = require('body-parser');
const accepts = require('accepts');
const { sync: globSync } = require('glob');
const { readFileSync } = require('fs');
const chalk = require('chalk');
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

function requireMocks(require, directory, mocks) {
  if (mocks) {
    mocks = requireFile(require, `${directory}/mocks`);
    return mocks ? mocks : true;
  }
  return false;
}

function buildServer(directory, config = {}) {
  const typeDefs = globSync(`${directory}/types/**/*.?(graphql|gql)`).map(
    readTypeFile
  );
  const require = esm(module);
  const resolvers = requireFile(require, `${directory}/resolvers`);
  const mocks = requireMocks(require, directory, config.mocks);
  const { context, introspection, debug, tracing } = config;

  try {
    return [
      new ApolloServer({
        typeDefs,
        resolvers,
        mocks,
        context,
        introspection,
        debug,
        tracing
      })
    ];
  } catch (e) {
    return [null, e];
  }
}

function mountServer(app, { dir, config, watcher }) {
  let [server, error] = buildServer(dir, config);
  if (error) {
    console.log(chalk.red('Error creating GraphQL server:'), error);
  } else {
    console.log(chalk.green('GraphQL server started.'));
  }
  const path = '/graphql';

  watcher.on('change', () => {
    [server, error] = buildServer(dir, config);
    if (error) {
      console.log(chalk.red('Error creating GraphQL server:'), error);
    } else {
      console.log(chalk.green('GraphQL server updated.'));
    }
  });

  app.use(path, json(), (req, res, next) => {
    if (req.method === 'GET') {
      const accept = accepts(req);
      const types = accept.types();
      const prefersHTML =
        types.find(x => x === 'text/html' || x === 'application/json') ===
        'text/html';

      if (prefersHTML) {
        return gui({
          endpoint: path,
          subscriptionsEndpoint: server && server.subscriptionsPath
        })(req, res, next);
      }
    }
    return graphqlExpress((req, res) => {
      if (error) {
        res.send({ errors: [`${error}`] });
      } else {
        return server.request(req);
      }
    })(req, res, next);
  });
}

module.exports = mountServer;
