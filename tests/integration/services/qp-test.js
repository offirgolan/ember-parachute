import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { buildQueryParams, Transforms } from 'ember-parachute';

const {
  on,
  run,
  assign
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

const defaultValues = {
  direction: 'asc',
  page: 1,
  showMenu: true,
  search: '',
  sort: 'name'
}

const Controller =  Ember.Controller.extend(QueryParams.Mixin);
let service;

function getController(service, routeName) {
  return service.cacheFor(routeName).controller;
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

test('assert - Controller w/ no Parachute', function(assert) {
  assert.expect(1);

  this.register('controller:index', Ember.Controller);

  run(() => {
    assert.throws(() => service.cacheFor('index'));
  });
});

test('queryParamsDidChange get called on update', function(assert) {
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

test('queryParamsFor', function(assert) {
  assert.expect(2);

  run(() => {
    let changes = { page: 2, direction: 'desc' };

    assert.deepEqual(service.queryParamsFor('index'), defaultValues);
    setQueryParams(service, 'index', changes);
    assert.deepEqual(service.queryParamsFor('index'), assign({}, defaultValues, changes));
  });
});

test('resetParams - all', function(assert) {
  assert.expect(2);

  run(() => {
    let changes = { page: 2, direction: 'desc' };

    setQueryParams(service, 'index', changes);
    assert.deepEqual(service.queryParamsFor('index'), assign({}, defaultValues, changes));

    service.resetParams('index');

    assert.deepEqual(service.queryParamsFor('index'), defaultValues);
  });
});

test('resetParams - individual', function(assert) {
  assert.expect(2);

  run(() => {
    let changes = { page: 2, direction: 'desc', sort: 'date' };

    setQueryParams(service, 'index', changes);
    assert.deepEqual(service.queryParamsFor('index'), assign({}, defaultValues, changes));

    service.resetParams('index', 'sort', 'page');

    assert.deepEqual(service.queryParamsFor('index'), assign(defaultValues, { direction: 'desc' }));
  });
});

test('setDefaultValue', function(assert) {
  assert.expect(2);

  run(() => {
    assert.deepEqual(service.queryParamsFor('index').page, 1);

    setQueryParams(service, 'index', { page: 2 });

    service.setDefaultValue('index', 'page', 2);
    service.resetParams('index', 'page');

    assert.deepEqual(service.queryParamsFor('index').page, 2);
  });
});
