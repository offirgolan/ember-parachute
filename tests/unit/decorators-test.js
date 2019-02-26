import EmberObject from '@ember/object';
import QueryParams from 'ember-parachute';
import { withParachute, queryParam } from 'ember-parachute/decorators';
import { module, test } from 'qunit';

@withParachute
class WithParachuteController extends EmberObject {}

class QPController extends EmberObject {
  @queryParam({
    as: 'dir',
    refresh: true
  })
  direction = 'asc';

  @queryParam page = 1;

  @queryParam({
    refresh: true,
    serialize() {},
    deserialize() {}
  })
  color = [];
}

module('Unit | Decorators', function() {
  let controller;

  module('withParachute', function(hooks) {
    hooks.beforeEach(function() {
      controller = WithParachuteController.create();
    });

    test('it works', function(assert) {
      assert.ok(typeof controller.resetQueryParams === 'function');
      assert.ok(typeof controller.setDefaultQueryParamValue === 'function');
      assert.ok(QueryParams.metaFor(controller));
    });
  });

  module('queryParam', function(hooks) {
    hooks.beforeEach(function() {
      controller = QPController.create();
    });

    test('it works', function(assert) {
      const { queryParams, queryParamsArray } = QueryParams.metaFor(controller);

      assert.equal(queryParamsArray.length, 3);
      assert.deepEqual(Object.keys(queryParams), [
        'direction',
        'page',
        'color'
      ]);
      assert.equal(queryParams.direction.as, 'dir');
      assert.equal(queryParams.page.defaultValue, 1);
      assert.ok(queryParams.color.serialize);
    });
  });
});
