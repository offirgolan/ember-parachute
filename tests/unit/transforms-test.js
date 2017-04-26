import { Transforms } from 'ember-parachute';
import { module, test } from 'qunit';

module('Unit | Transforms');

test('Boolean', function(assert) {
  assert.equal(Transforms.Boolean('true'), true);
  assert.equal(Transforms.Boolean(null), false);
});

test('String', function(assert) {
  assert.equal(Transforms.String('foo'), 'foo');
  assert.equal(Transforms.String(null), 'null');
});

test('Number', function(assert) {
  assert.equal(Transforms.Number('123.45'), 123.45);
  assert.equal(Transforms.Number(null), 0);
});

test('Array', function(assert) {
  assert.equal(Transforms.Array([1, 2, 3]), '1,2,3');
  assert.equal(Transforms.Array([]), '');
  assert.equal(Transforms.Array(null), '');
});

test('Object', function(assert) {
  assert.deepEqual(Transforms.Object({}), {});
  assert.deepEqual(Transforms.Object({ foo: 'bar' }), { foo: 'bar' });
  assert.deepEqual(Transforms.Object(null), {});
});
