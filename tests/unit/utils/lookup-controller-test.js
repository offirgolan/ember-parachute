import lookupController from 'ember-parachute/utils/lookup-controller';
import { module, test } from 'qunit';

module('Unit | Utility | lookup controller');

const dummyRoute = {
  controller: { isController: true }
}
function dummyLookup() {
  return {
    lookup() {
      return { isController: true };
    }
  };
}

test('it looks up the controller from a route', function(assert) {
  let result = lookupController(dummyRoute);
  assert.ok(result.isController);
});

test('it looks up the controller from a route owner if route controller is not defined', function(assert) {
  let result = lookupController({}, dummyLookup);
  assert.ok(result.isController);
});
