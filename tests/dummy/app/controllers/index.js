import Ember from 'ember';
import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';

const {
  inject,
  computed
} = Ember;

const queryParams = new QueryParams({
  parachuteOpen: {
    as: 'parachute',
    defaultValue: true,
  },
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    refresh: true
  },
  page: {
    defaultValue: 1,
    refresh: true
  },
  per: {
    defaultValue: 25,
    refresh: true
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  sort: {
    defaultValue: 'name',
    refresh: true
  },
  tags: {
    defaultValue: [ 'Ember', 'Parachute' ]
  }
});

export default Ember.Controller.extend(queryParams.Mixin, {
  qp: inject.service(),

  queryParamsChanged: computed.or('queryParamsState.{page,search,tags}.changed'),

  queryParamsDidChange({ shouldRefresh, queryParams }) {
    if (shouldRefresh && queryParams.parachuteOpen) {
      this.get('fetchModel').perform();
    }
  },

  fetchModel: task(function *() {
    yield timeout(1000);
  }).restartable(),

  actions: {
    addTag(tag) {
      this.get('tags').addObject(tag);
    },

    removeTag(tag) {
      this.get('tags').removeObject(tag);
    },

    resetAll() {
      this.get('qp').resetParamsFor('index');
    }
  }
});
