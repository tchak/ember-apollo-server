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

  test('DateTime', async function(assert) {
    let data = await this.apollo.query({
      query: gql`
        query {
          nowDate
          nowTime
          nowDateTime
        }
      `
    });

    assert.ok(data.nowDate.match(/\d{4}-\d{2}-\d{2}/)); // 2018-06-12
    assert.ok(data.nowTime.match(/\d{2}:\d{2}:\d{2}.\d*Z/)); // 21:08:45.812Z
  });

  test('DataSource#people', async function(assert) {
    let data = await this.apollo.query({
      query: gql`
        query {
          people
        }
      `
    });

    assert.deepEqual(data.people, ['Paul']);
  });
});
