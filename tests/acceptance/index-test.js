import { module, test } from 'qunit';
import { visit, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | index', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function(assert) {
    await visit('/');

    fillIn('input[type="text"]', 'query text');
    await waitFor('md-progress-linear')

    assert.expect(0);
  });
});
