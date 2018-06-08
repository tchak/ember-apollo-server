/* eslint no-console:0 */
const { gql } = require('apollo-server');
const fetch = require('node-fetch');
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
  const resolvers = requireFile(require, `${directory}/resolvers`);
  const Adapter = requireFile(require, `${directory}/adapter`);
  const mocks = requireMocks(require, directory, config.mocks);
  const { introspection, debug, tracing } = config;
  const adapter = Adapter ? new Adapter() : { fetch };
  const context = buildContext(
    requireFile(require, `${directory}/context`),
    adapter
  );

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

function buildContext(context, adapter) {
  if (context) {
    if (typeof context === 'function') {
      return _ => Object.assign(context(_), { adapter });
    }
    return Object.assign(context, { adapter });
  }
  return { adapter };
}
