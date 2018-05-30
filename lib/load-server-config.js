/* eslint no-console:0 */
const { gql } = require('apollo-server');
const DefaultAdapter = require('./default-adapter');
const { sync: globSync } = require('glob');
const { readFileSync } = require('fs');
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

module.exports = function loadServerConfig(directory, config = {}) {
  const typeDefs = globSync(`${directory}/types/**/*.?(graphql|gql)`).map(
    readTypeFile
  );
  const require = esm(module);
  let resolvers = requireFile(require, `${directory}/resolvers`);
  const Adapter = requireFile(require, `${directory}/adapter`);
  const mocks = requireMocks(require, directory, config.mocks);
  const { context, introspection, debug, tracing } = config;

  if (typeof resolvers === 'function') {
    const adapter = new (Adapter || DefaultAdapter)();
    resolvers = resolvers(adapter);
  } else if (Adapter) {
    throw new Error('Adapter defined but not injected.');
  }

  return {
    typeDefs,
    resolvers,
    mocks,
    context,
    introspection,
    debug,
    tracing
  };
};
