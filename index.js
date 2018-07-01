'use strict';
const path = require('path');
const sane = require('sane');
const { mountServer } = require('./lib/mount-server');

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

    const clientConfig = app.project.config(app.env)['apollo'] || {};
    this.addonBuildConfig = app.options['apollo-server'] || {};

    const isDebugEnv = app.env === 'development' || app.env === 'test';
    this.modulesCache = !isDebugEnv;

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

    this.graphqlPath =
      this.addonBuildConfig.path || clientConfig.apiURL || '/graphql';

    this._super.included.apply(this, arguments);

    if (this.addonBuildConfig.directory) {
      this.graphqlDirectory = this.addonBuildConfig.directory;
    } else if (
      app.project.pkg['ember-addon'] &&
      app.project.pkg['ember-addon'].configPath
    ) {
      this.graphqlDirectory = path.resolve(
        app.project.root,
        path.join('tests', 'dummy', 'graphql')
      );
    } else {
      this.graphqlDirectory = path.join(app.project.root, 'graphql');
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

  mountApolloServer(app, gui = true) {
    mountServer(app, {
      dir: this.graphqlDirectory,
      config: this.addonBuildConfig,
      watcher: this.watchGraphQLFiles(),
      path: this.graphqlPath,
      cache: this.modulesCache,
      gui
    });
  },

  serverMiddleware({ app }) {
    this.mountApolloServer(app);
  },

  testemMiddleware(app) {
    this.mountApolloServer(app, false);
  }
};
