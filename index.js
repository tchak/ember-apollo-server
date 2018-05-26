'use strict';
const path = require('path');
const sane = require('sane');
const mountServer = require('./lib/mount-server');

module.exports = {
  name: 'ember-apollo-server',

  included() {
    let app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    } else {
      // Otherwise, we'll use this implementation borrowed from the _findHost()
      // method in ember-cli.
      let current = this;
      do {
        app = current.app || app;
      } while (current.parent.parent && (current = current.parent));
    }

    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['apollo-server'] || {};
    this.addonBuildConfig = this.app.options['apollo-server'] || {};

    let isDebugEnv = app.env === 'development' || app.env === 'test';
    if (!this.addonBuildConfig.mocks) {
      this.addonBuildConfig.mocks = isDebugEnv;
    }
    if (!(typeof this.addonBuildConfig.debug === 'boolean')) {
      this.addonBuildConfig.debug = isDebugEnv;
    }
    if (!(typeof this.addonBuildConfig.introspection === 'boolean')) {
      this.addonBuildConfig.introspection = isDebugEnv;
    }
    if (!(typeof this.addonBuildConfig.tracing === 'boolean')) {
      this.addonBuildConfig.tracing = isDebugEnv;
    }

    // Call super after initializing config so we can use _shouldIncludeFiles for the node assets
    this._super.included.apply(this, arguments);

    if (this.addonBuildConfig.directory) {
      this.graphqlDirectory = this.addonBuildConfig.directory;
    } else if (this.addonConfig.directory) {
      this.graphqlDirectory = this.addonConfig.directory;
    } else if (
      app.project.pkg['ember-addon'] &&
      app.project.pkg['ember-addon'].configPath
    ) {
      this.graphqlDirectory = path.resolve(
        app.project.root,
        path.join('tests', 'dummy', 'graphql')
      );
    } else {
      this.graphqlDirectory = path.join(this.app.project.root, '/graphql');
    }
  },

  watchGraphQLFiles() {
    if (!this.graphqlWatcher) {
      this.graphqlWatcher = sane(this.graphqlDirectory, {
        glob: ['**/*.mjs', '**/*.js', '**/*.gql', '**/*.graphql']
      });
    }
    return this.graphqlWatcher;
  },

  mountApolloServer(app) {
    mountServer(app, {
      dir: this.graphqlDirectory,
      config: this.addonBuildConfig,
      watcher: this.watchGraphQLFiles()
    });
  },

  serverMiddleware({ app }) {
    this.mountApolloServer(app);
  },

  testemMiddleware(app) {
    this.mountApolloServer(app);
  }
};
