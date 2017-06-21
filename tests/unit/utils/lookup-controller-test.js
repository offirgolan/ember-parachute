import Ember from 'ember';
import lookupController from 'ember-parachute/utils/lookup-controller';
import { module, test } from 'qunit';

module('Unit | Utility | lookup controller');

const Controller = Ember.Controller.extend({
  parachuteController: true
})

const dummyRoute = {
  controller: Controller.create()
}

function dummyLookup() {
  return {
    factoryFor() {
      return {
        create: () => Controller.create(),
        class: Controller
      };
    }
  };
}

test('it looks up the controller from a route', function(assert) {
  let result = lookupController(dummyRoute);
  assert.ok(result.parachuteController);
});

test('it looks up the controller from a route owner if route controller is not defined', function(assert) {
  let result = lookupController({}, dummyLookup);
  assert.ok(result.parachuteController);
});
