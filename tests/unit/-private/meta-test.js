import ParachuteMeta from 'ember-parachute/-private/parachute-meta';
import { module, test } from 'qunit';

module('Unit | Implementation | meta');

const dummyQpMap = {
  foo: {
    defaultValue: 'foo',
    refresh: true
  },
  bar: {
    defaultValue: 1,
    as: 'BAR'
  }
};

test('#queryParams', function(assert) {
  let expectedResult = {
    'bar': {
      'as': 'BAR',
      'defaultValue': 1,
      'deserialize': undefined,
      'key': 'bar',
      'refresh': false,
      'scope': undefined,
      'serialize': undefined
    },
    'foo': {
      'as': 'foo',
      'defaultValue': 'foo',
      'deserialize': undefined,
      'key': 'foo',
      'refresh': true,
      'scope': undefined,
      'serialize': undefined
    }
  };
  let meta = new ParachuteMeta(dummyQpMap);
  assert.propEqual(meta.queryParams, expectedResult);
});

test('#queryParamsArray', function(assert) {
  let expectedResult = [
    {
      'as': 'foo',
      'defaultValue': 'foo',
      'deserialize': undefined,
      'key': 'foo',
      'refresh': true,
      'scope': undefined,
      'serialize': undefined
    },
    {
      'as': 'BAR',
      'defaultValue': 1,
      'deserialize': undefined,
      'key': 'bar',
      'refresh': false,
      'scope': undefined,
      'serialize': undefined
    }
  ];
  let meta = new ParachuteMeta(dummyQpMap);
  assert.propEqual(meta.queryParamsArray, expectedResult);
});
