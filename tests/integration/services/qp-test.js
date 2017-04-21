import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { buildQueryParams, Transforms } from 'ember-parachute';

const {
  on,
  run
} = Ember;

const QueryParams = buildQueryParams({
  direction: {
    name: 'dir',
    defaultValue: 'asc',
    normalize: Transforms.String,
    refresh: true
  },
  page: {
    defaultValue: 1,
    normalize: Transforms.Number,
    refresh: true
  },
  showMenu: {
    defaultValue: true,
    normalize: Transforms.Boolean,
    refresh: false
  },
  search: {
    defaultValue: '',
    normalize: Transforms.String,
    refresh: true
  },
  sort: {
    defaultValue: 'name',
    normalize: Transforms.String,
    refresh: true
  },
});

const Controller =  Ember.Controller.extend(QueryParams.Mixin);
let service;

function getController(service, routeName) {
  return service.cacheFor(routeName).controller;
}

moduleFor('service:qp', 'Integration | Service | qp', {
  integration: true,

  beforeEach() {
    this.register('controller:index', Controller);
    service = this.subject()
  }
});

test('queryParamsDidChange get called on updated', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    queryParamsDidChange() {
      assert.ok(true);
      done();
    }
  }));

  run(() => {
    let controller = getController(service, 'index');
    service.update('index', controller);
  });
});

test('queryParamsDidChange event gets triggered on updated', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    onChanged: on('queryParamsDidChange', function() {
      assert.ok(true);
      done();
    })
  }));

  run(() => {
    let controller = getController(service, 'index');
    service.update('index', controller);
  });
});
