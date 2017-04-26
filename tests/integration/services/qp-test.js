import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import QueryParams from 'ember-parachute';

const {
  on,
  run,
} = Ember;

const queryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    refresh: true
  },
  page: {
    defaultValue: 1,
    refresh: true
  },
  showMenu: {
    defaultValue: true,
    refresh: false
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  sort: {
    defaultValue: 'name',
    refresh: true
  }
});

const Controller =  Ember.Controller.extend(queryParams.Mixin);
let service;

function getController(service, routeName) {
  return service._cacheFor(routeName).controller;
}

function setQueryParams(service, routeName, params = {}) {
  let controller = getController(service, routeName);

  controller.setProperties(params);
  service.update(routeName, controller, params);
}

moduleFor('service:qp', 'Integration | Service | qp', {
  integration: true,

  beforeEach() {
    this.register('controller:index', Controller);
    service = this.subject()
  }
});

test('queryParamsDidChange gets called on update', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    queryParamsDidChange() {
      assert.ok(true);
      done();
    }
  }));

  run(() => {
    setQueryParams(service, 'index', {});
  });
});

test('queryParamsDidChange event gets triggered on update', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    onChanged: on('queryParamsDidChange', function() {
      assert.ok(true);
      done();
    })
  }));

  run(() => {
    setQueryParams(service, 'index', {});
  });
});

test('queryParamsDidChange - shouldRefresh - false', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    queryParamsDidChange({ shouldRefresh }) {
      assert.notOk(shouldRefresh);
      done();
    }
  }));

  run(() => {
    setQueryParams(service, 'index', { showMenu: false });
  });
});

test('queryParamsDidChange - shouldRefresh - true', function(assert) {
  assert.expect(1);

  let done = assert.async();
  this.register('controller:index', Controller.extend({
    queryParamsDidChange({ shouldRefresh }) {
      assert.ok(shouldRefresh);
      done();
    }
  }));

  run(() => {
    setQueryParams(service, 'index', { page: 2, showMenu: false });
  });
});
