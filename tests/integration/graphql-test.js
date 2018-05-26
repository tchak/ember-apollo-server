import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import gql from 'graphql-tag';

module('Unit | Service | graphql', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.apollo = this.owner.lookup('service:apollo');
  });

  test('fetch hello query', async function(assert) {
    let data = await this.apollo.query({
      query: gql`
        query {
          hello
        }
      `
    });

    assert.equal(data.hello, 'Hello World!');
  });

  test('fetch mock query', async function(assert) {
    let data = await this.apollo.query({
      query: gql`
        query {
          mock
        }
      `
    });

    assert.equal(data.mock, 'Hello World');
  });

  test('fetch mock user query', async function(assert) {
    let data = await this.apollo.query({
      query: gql`
        query {
          me {
            name
          }
        }
      `
    });

    assert.equal(data.me.name, 'Paul Chavard');
  });
});
