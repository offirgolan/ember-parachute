import EmberObject from '@ember/object';
import { assign } from '@ember/polyfills';
import QueryParams from 'ember-parachute';
import { module, test } from 'qunit';

const { keys } = Object;

const queryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    refresh: true
  },
  page: {
    defaultValue: 1,
    refresh: true
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  colors: {
    defaultValue: [],
    refresh: true,
    serialize(value, controller) {
      assertController(controller);
      return value.toString();
    },
    deserialize(value = '', controller) {
      assertController(controller);
      return value.split(',');
    }
  }
});

const defaultValues = {
  direction: 'asc',
  page: 1,
  search: '',
  colors: []
};

const Controller = EmberObject.extend(queryParams.Mixin);
let controller;

function assertController(controller) {
  if (!(controller instanceof Controller)) {
    throw new Error(
      'Expected the controller to be passed as the second parameter to serialize / deserialize.'
    );
  }
}

module('Unit | QueryParams', function(hooks) {
  hooks.beforeEach(function() {
    controller = Controller.create();
  });

  test('create', function(assert) {
    assert.expect(2);

    let QP, controller, queryParams;

    QP = new QueryParams(
      { foo: { defaultValue: 1 } },
      { bar: { defaultValue: 1 } },
      { baz: { defaultValue: 1 } }
    );
    controller = EmberObject.extend(QP.Mixin).create();
    queryParams = QueryParams.metaFor(controller).queryParams;

    assert.deepEqual(keys(queryParams), ['foo', 'bar', 'baz']);

    QP = new QueryParams(
      { foo: { defaultValue: 1 } },
      { bar: { defaultValue: 1 } },
      { bar: { defaultValue: undefined } }
    );
    controller = EmberObject.extend(QP.Mixin).create();
    queryParams = QueryParams.metaFor(controller).queryParams;

    assert.deepEqual(keys(queryParams), ['foo', 'bar']);
  });

  test('extend', function(assert) {
    assert.expect(1);

    let QP = new QueryParams({ foo: { defaultValue: 1 } });
    QP = QP.extend({ bar: { defaultValue: 1 } }, { baz: { defaultValue: 1 } });

    assert.deepEqual(keys(QP.queryParams), ['foo', 'bar', 'baz']);
  });

  test('QP Normalization', function(assert) {
    assert.expect(5);

    let QP = new QueryParams({
      foo: { defaultValue: 1 },
      bar: { defaultValue: 1, as: '_bar_' }
    });

    controller = EmberObject.extend(QP.Mixin).create();
    let queryParams = QueryParams.metaFor(controller).queryParams;

    assert.equal(queryParams.foo.key, 'foo');
    assert.equal(queryParams.foo.as, 'foo');
    assert.equal(typeof queryParams.foo.value, 'function');

    assert.equal(queryParams.bar.key, 'bar');
    assert.equal(queryParams.bar.as, '_bar_');
  });

  test('setDefaultQueryParamValue + resetQueryParams', function(assert) {
    assert.expect(4);

    assert.equal(controller.get('page'), 1);

    controller.set('page', 2);
    assert.ok(controller.get('queryParamsState.page.changed'));

    controller.setDefaultQueryParamValue('page', 2);
    assert.notOk(controller.get('queryParamsState.page.changed'));

    controller.resetQueryParams(['page']);
    assert.equal(controller.get('page'), 2);
  });

  test('resetQueryParams - all', function(assert) {
    assert.expect(2);

    let changes = { page: 2, direction: 'desc' };

    controller.setProperties(changes);
    assert.deepEqual(
      controller.get('allQueryParams'),
      assign({}, defaultValues, changes)
    );

    controller.resetQueryParams();
    assert.deepEqual(controller.get('allQueryParams'), defaultValues);
  });

  test('resetQueryParams - individual', function(assert) {
    assert.expect(2);

    let changes = { page: 2, direction: 'desc', search: 'date' };

    controller.setProperties(changes);
    assert.deepEqual(
      controller.get('allQueryParams'),
      assign({}, defaultValues, changes)
    );

    controller.resetQueryParams(['search', 'page']);
    assert.deepEqual(
      controller.get('allQueryParams'),
      assign(defaultValues, { direction: 'desc' })
    );
  });

  test('CP - allQueryParams', function(assert) {
    assert.expect(2);

    assert.deepEqual(controller.get('allQueryParams'), {
      direction: 'asc',
      page: 1,
      search: '',
      colors: []
    });

    controller.set('page', 2);

    assert.deepEqual(controller.get('allQueryParams'), {
      direction: 'asc',
      page: 2,
      search: '',
      colors: []
    });
  });

  test('CP - queryParamsState', function(assert) {
    assert.expect(4);

    assert.deepEqual(controller.get('queryParamsState.page'), {
      value: 1,
      defaultValue: 1,
      changed: false,
      as: 'page',
      serializedValue: 1
    });

    controller.set('page', 2);

    assert.deepEqual(controller.get('queryParamsState.page'), {
      value: 2,
      defaultValue: 1,
      changed: true,
      as: 'page',
      serializedValue: 2
    });

    controller.setDefaultQueryParamValue('page', 2);

    assert.deepEqual(controller.get('queryParamsState.page'), {
      value: 2,
      defaultValue: 2,
      changed: false,
      as: 'page',
      serializedValue: 2
    });

    controller.set('colors', ['red', 'blue']);

    assert.deepEqual(controller.get('queryParamsState.colors'), {
      value: ['red', 'blue'],
      serializedValue: 'red,blue',
      defaultValue: [],
      changed: true,
      as: 'colors'
    });
  });
});
