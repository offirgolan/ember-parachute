import ParachuteMeta from 'ember-parachute/-private/parachute-meta';
import { module, test } from 'qunit';

module('Unit | Implementation | meta', function() {
  const dummyQpMap = {
    foo: {
      defaultValue: 'foo',
      refresh: true
    },
    bar: {
      defaultValue: 1,
      as: 'BAR',
      replace: true
    }
  };

  test('#queryParams', function(assert) {
    let expectedResult = {
      bar: {
        as: 'BAR',
        defaultValue: 1,
        deserialize: undefined,
        key: 'bar',
        refresh: false,
        replace: true,
        scope: undefined,
        serialize: undefined
      },
      foo: {
        as: 'foo',
        defaultValue: 'foo',
        deserialize: undefined,
        key: 'foo',
        refresh: true,
        replace: false,
        scope: undefined,
        serialize: undefined
      }
    };

    let meta = new ParachuteMeta(dummyQpMap);
    assert.propEqual(meta.queryParams, expectedResult);
  });

  test('#queryParamsArray', function(assert) {
    let expectedResult = [
      {
        as: 'foo',
        defaultValue: 'foo',
        deserialize: undefined,
        key: 'foo',
        refresh: true,
        replace: false,
        scope: undefined,
        serialize: undefined
      },
      {
        as: 'BAR',
        defaultValue: 1,
        deserialize: undefined,
        key: 'bar',
        refresh: false,
        replace: true,
        scope: undefined,
        serialize: undefined
      }
    ];

    let { queryParamsArray } = new ParachuteMeta(dummyQpMap);
    assert.propEqual(queryParamsArray.objectAt(0), expectedResult[0]);
    assert.propEqual(queryParamsArray.objectAt(1), expectedResult[1]);
  });

  test('#qpMapForController', function(assert) {
    let expectedResult = {
      foo: {
        as: 'foo',
        scope: undefined
      },
      bar: {
        as: 'BAR',
        scope: undefined
      }
    };

    let meta = new ParachuteMeta(dummyQpMap);
    assert.propEqual(meta.qpMapForController, expectedResult);
  });

  test('#qpMapForRoute', function(assert) {
    let expectedResult = {
      foo: {
        replace: false
      },
      bar: {
        replace: true
      }
    };

    let meta = new ParachuteMeta(dummyQpMap);
    assert.propEqual(meta.qpMapForRoute, expectedResult);
  });

  test('#defaultValues', function(assert) {
    let expectedResult = {
      foo: 'foo',
      bar: 1
    };

    let meta = new ParachuteMeta(dummyQpMap);
    assert.propEqual(meta.defaultValues, expectedResult);
  });
});
