import QueryParamsBuilder from 'ember-parachute/-private/query-params-builder';
import { module, test } from 'qunit';

const {
  keys
} = Object;

module('Unit | Query Params Builder');

test('asserts', function(assert) {
  assert.expect(2);

  assert.throws(() => new QueryParamsBuilder());
  assert.throws(() => new QueryParamsBuilder({ foo: true }));
});

test('extend', function(assert) {
  assert.expect(1);

  let builder = new QueryParamsBuilder({ foo: {} });
  builder = builder.extend({ bar: {} }, { baz: {} });

  assert.deepEqual(keys(builder.queryParams), ['foo', 'bar', 'baz']);
});

test('QP Normalization', function(assert) {
  assert.expect(5);

  let builder = new QueryParamsBuilder({
    foo: {},
    bar: { name: '_bar_' }
  });

  let { queryParams } = builder;

  assert.equal(queryParams.foo.key, 'foo');
  assert.equal(queryParams.foo.name, 'foo');
  assert.equal(typeof queryParams.foo.value, 'function');

  assert.equal(queryParams.bar.key, 'bar');
  assert.equal(queryParams.bar.name, '_bar_');
});
