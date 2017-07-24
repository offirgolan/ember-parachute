import Ember from 'ember';
import QueryParams from 'ember-parachute';
import ParachuteEvent from 'ember-parachute/-private/parachute-event';
import { initialize } from 'dummy/instance-initializers/ember-parachute';
import { moduleFor, test } from 'ember-qunit';

const {
  on,
  getOwner
} = Ember;

const queryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    refresh: true
  },
  page: {
    defaultValue: 1,
    refresh: true,
    replace: true
  },
  search: {
    defaultValue: '',
    refresh: true
  }
});

const EmberRoute = Ember.Route;
const Controller = Ember.Controller.extend(queryParams.Mixin);
let route;

moduleFor('foo', 'Integration | Route', {
  integration: true,

  beforeEach() {
    Ember.Route = Ember.Route.extend();

    initialize();
    this.register('route:foo', Ember.Route.extend());

    route = getOwner(this).lookup('route:foo');
  },

  afterEach() {
    Ember.Route = EmberRoute;
  }
});

test('#setup', function(assert) {
  assert.expect(2);

  let controller = Controller.extend({
    setup(event) {
      assert.ok(event instanceof ParachuteEvent);
    },

    onSetup: on('setup', function(event) {
      assert.ok(event instanceof ParachuteEvent);
    })
  }).create();


  route.setupController(controller);
});

test('#reset', function(assert) {
  assert.expect(4);

  let controller = Controller.extend({
    reset(event, isExiting) {
      assert.ok(event instanceof ParachuteEvent);
      assert.equal(typeof isExiting, 'boolean');
    },

    onReset: on('reset', function(event, isExiting) {
      assert.ok(event instanceof ParachuteEvent);
      assert.equal(typeof isExiting, 'boolean');
    })
  }).create();

  route.resetController(controller, true);
});

test('#queryParamsDidChange', function(assert) {
  assert.expect(2);

  let controller = Controller.extend({
    queryParamsDidChange(event) {
      assert.ok(event instanceof ParachuteEvent);
    },

    onReset: on('queryParamsDidChange', function(event) {
      assert.ok(event instanceof ParachuteEvent);
    })
  }).create();

  route.setProperties({
    routeName: 'foo',
    controller
  })

  Ember.run(() => {
    route.send('queryParamsDidChange', {}, {}, {});
  });
});

test('route queryParams map', function(assert) {
  assert.expect(1);

  let controller = Controller.create();

  route.set('queryParams', {
    search: { refreshModel: true }
  });

  route.setupController(controller);

  assert.propEqual(route.get('queryParams'), {
    direction: { replace: false },
    page: { replace: true },
    search: { replace: false, refreshModel: true }
  });
});
