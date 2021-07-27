import Controller from '@ember/controller';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import { run } from '@ember/runloop';
import QueryParams from 'ember-parachute';
import ParachuteEvent from 'ember-parachute/-private/parachute-event';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Transition from '@ember/routing/-private/transition';

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

const QPController = Controller.extend(queryParams.Mixin);
let route;

module('Unit | Route', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    run(() => {
      this.owner.register('route:foo', Route.extend());
      route = this.owner.lookup('route:foo');
    });
  });

  test('#setup', function(assert) {
    assert.expect(2);

    let controller = QPController.extend({
      setup(event, transition) {
        assert.ok(event instanceof ParachuteEvent);
        assert.ok(transition instanceof Transition);
        debugger
      },

      onSetup: on('setup', function(event, transition) {
        assert.ok(event instanceof ParachuteEvent);
        assert.ok(transition instanceof Transition);
      })
    }).create();

    route.setupController(controller);
  });

  test('#reset', function(assert) {
    assert.expect(4);

    let controller = QPController.extend({
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

    let controller = QPController.extend({
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
    });

    run(() => {
      route.send('queryParamsDidChange', {}, {}, {});
    });
  });

  test('route queryParams map', function(assert) {
    assert.expect(1);

    let controller = QPController.create();

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
});
