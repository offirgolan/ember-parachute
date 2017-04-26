import Ember from 'ember';
import { QueryParams, Transforms } from 'ember-parachute';
import { module, test } from 'qunit';

const {
  assign
} = Ember;

const {
  keys
} = Object;

const queryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    normalize: Transforms.String,
    refresh: true
  },
  page: {
    defaultValue: 1,
    normalize: Transforms.Number,
    refresh: true
  },
  search: {
    defaultValue: '',
    normalize: Transforms.String,
    refresh: true
  }
});

const defaultValues = {
  direction: 'asc',
  page: 1,
  search: ''
}

const Controller = Ember.Object.extend(queryParams.Mixin);
let controller;

module('Unit | QueryParams', {
  beforeEach() {
    controller = Controller.create();
  }
});

test('asserts', function(assert) {
  assert.expect(3);

  assert.throws(() => new QueryParams());
  assert.throws(() => new QueryParams({}, {}, {}));
  assert.throws(() => QueryParams._metaFor(Ember.Object.create()));
});

test('create', function(assert) {
  assert.expect(2);

  let QP, controller, queryParams;

  QP = new QueryParams({ foo: {} }, { bar: {} }, { baz: 1 });
  controller = Ember.Object.extend(QP.Mixin).create();
  queryParams = QueryParams._metaFor(controller).queryParams;

  assert.deepEqual(keys(queryParams), ['foo', 'bar']);

  QP = new QueryParams({ foo: {} }, { bar: {} }, { bar: undefined });
  controller = Ember.Object.extend(QP.Mixin).create();
  queryParams = QueryParams._metaFor(controller).queryParams;

  assert.deepEqual(keys(queryParams), ['foo']);
});

test('extend', function(assert) {
  assert.expect(1);

  let QP = new QueryParams({ foo: {} });
  QP = QP.extend({ bar: {} }, { baz: {} });

  assert.deepEqual(keys(QP.queryParams), ['foo', 'bar', 'baz']);
});

test('QP Normalization', function(assert) {
  assert.expect(5);

  let QP = new QueryParams({
    foo: {},
    bar: { as: '_bar_' }
  });

  controller = Ember.Object.extend(QP.Mixin).create();
  let queryParams = QueryParams._metaFor(controller).queryParams;

  assert.equal(queryParams.foo.key, 'foo');
  assert.equal(queryParams.foo.as, 'foo');
  assert.equal(typeof queryParams.foo.value, 'function');

  assert.equal(queryParams.bar.key, 'bar');
  assert.equal(queryParams.bar.as, '_bar_');
});

test('setDefaultValue + resetParamsFor', function(assert) {
  assert.expect(4);

  assert.equal(controller.get('page'), 1);

  controller.set('page', 2);
  assert.ok(controller.get('queryParamsState.page.changed'));

  QueryParams.setDefaultValue(controller, 'page', 2);
  assert.notOk(controller.get('queryParamsState.page.changed'));

  QueryParams.resetParamsFor(controller, ['page']);
  assert.equal(controller.get('page'), 2);
});

test('queryParamsFor', function(assert) {
  assert.expect(2);

  let changes = { page: 2, direction: 'desc' };

  assert.deepEqual(QueryParams.queryParamsFor(controller), defaultValues);
  controller.setProperties(changes);
  assert.deepEqual(QueryParams.queryParamsFor(controller), assign({}, defaultValues, changes));
});

test('resetParamsFor - all', function(assert) {
  assert.expect(2);

  let changes = { page: 2, direction: 'desc' };

  controller.setProperties(changes);
  assert.deepEqual(controller.get('allQueryParams'), assign({}, defaultValues, changes));

  QueryParams.resetParamsFor(controller);
  assert.deepEqual(controller.get('allQueryParams'), defaultValues);
});

test('resetParamsFor - individual', function(assert) {
  assert.expect(2);

  let changes = { page: 2, direction: 'desc', search: 'date' };

  controller.setProperties(changes);
  assert.deepEqual(controller.get('allQueryParams'), assign({}, defaultValues, changes));

  QueryParams.resetParamsFor(controller, ['search', 'page']);
  assert.deepEqual(controller.get('allQueryParams'), assign(defaultValues, { direction: 'desc' }));
});

test('CP - allQueryParams', function(assert) {
  assert.expect(2);

  assert.deepEqual(controller.get('allQueryParams'), {
    direction: 'asc',
    page: 1,
    search: ''
  });

  controller.set('page', 2);

  assert.deepEqual(controller.get('allQueryParams'), {
    direction: 'asc',
    page: 2,
    search: ''
  });
});

test('CP - queryParamsState', function(assert) {
  assert.expect(3);

  assert.deepEqual(controller.get('queryParamsState.page'), {
    value: 1,
    defaultValue: 1,
    changed: false
  });

  controller.set('page', 2);

  assert.deepEqual(controller.get('queryParamsState.page'), {
    value: 2,
    defaultValue: 1,
    changed: true
  });

  QueryParams.setDefaultValue(controller, 'page', 2);

  assert.deepEqual(controller.get('queryParamsState.page'), {
    value: 2,
    defaultValue: 2,
    changed: false
  });
});
