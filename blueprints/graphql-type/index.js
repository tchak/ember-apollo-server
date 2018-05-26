'use strict';

const path = require('path');
const stringUtils = require('ember-cli-string-utils');

module.exports = {
  description: 'Generates a GraphQL type definition.',

  anonymousOptions: ['name'],

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
  },

  locals(options) {
    return {
      typeClassName: stringUtils.classify(options.entity.name)
    };
  }
};
