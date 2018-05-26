'use strict';

const path = require('path');

module.exports = {
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  fileMapTokens: function() {
    const self = this;
    return {
      __root__: function(options) {
        if (
          !!self.project.config()['apollo-server'] &&
          !!self.project.config()['apollo-server'].directory
        ) {
          return self.project.config()['apollo-server'].directory;
        } else if (options.inAddon) {
          return path.join('tests', 'dummy', 'graphql');
        } else {
          return '/graphql';
        }
      }
    };
  }
};
