import Ember from 'ember';
import lookupController from 'ember-parachute/utils/lookup-controller';
import { module, test } from 'qunit';

module('Unit | Utility | lookup controller');

const dummyRoute = {
  controller: Ember.Controller.create()
}

function dummyLookup() {
  return {
    factoryFor() {
      return {
        class: Ember.Controller
      };
    }
  };
}

test('it looks up the controller from a route', function(assert) {
  let result = lookupController(dummyRoute);
  assert.equal(result, dummyRoute.controller);
});

test('it looks up the controller from a route owner if route controller is not defined', function(assert) {
  let result = lookupController({}, dummyLookup);
  assert.ok(result.isController);
});
