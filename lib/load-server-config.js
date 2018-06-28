/* eslint no-console:0 */
const { gql } = require('apollo-server');
const { sync: globSync } = require('glob');
const { readFileSync } = require('fs');
const esm = require('esm');
const decache = require('decache');
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

const defaultResolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime
};

function readTypeFile(path) {
  let content = readFileSync(path, { encoding: 'utf-8' });
  return gql`
    ${content}
  `;
}

function requireFile(require, path) {
  let filename = globSync(`${path}.?(js|mjs)`)[0];
  if (filename) {
    decache(filename);
  }
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

module.exports = function loadServerConfig(directory, config = {}) {
  const typeDefs = globSync(`${directory}/types/**/*.?(graphql|gql)`).map(
    readTypeFile
  );
  typeDefs.push(gql`
    scalar Date

    scalar Time

    scalar DateTime
  `);
  const require = esm(module, { cache: config.cache });
  let resolvers = requireFile(require, `${directory}/resolvers`);
  const context = requireFile(require, `${directory}/context`);
  const dataSources = requireFile(require, `${directory}/data-sources`);
  const mocks = requireMocks(require, directory, config.mocks);
  const { introspection, debug, tracing } = config;

  if (resolvers) {
    resolvers = Object.assign({}, defaultResolvers, resolvers);
  } else {
    resolvers = defaultResolvers;
  }

  return {
    typeDefs,
    resolvers,
    mocks,
    dataSources: dataSources ? () => dataSources : undefined,
    context,
    introspection,
    debug,
    tracing
  };
};
