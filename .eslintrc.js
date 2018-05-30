module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: ['ember', 'prettier'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'prettier'],
  env: {
    browser: true
  },
  rules: {
    'prettier/prettier': 'error'
  },
  overrides: [
    // node files
    {
      files: [
        'index.js',
        'testem.js',
        'load-server-config.js',
        'ember-cli-build.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
        'lib/**/*.js',
        'graphql/**/*.js',
        'tests/dummy/graphql/**/*.js'
      ],
      excludedFiles: [
        'app/**',
        'addon/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    },
    {
      files: [
        'tests/dummy/graphql/**/*.js'
      ],
      rules: {
        'node/no-unsupported-features': 0
      },
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2017
      }
    }
  ]
};
