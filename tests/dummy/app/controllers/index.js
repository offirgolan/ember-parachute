import { or } from '@ember/object/computed';
import Controller from '@ember/controller';
import { A as emberArray } from '@ember/array';
import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';

const queryParams = new QueryParams({
  parachuteOpen: {
    as: 'parachute',
    defaultValue: true,
    serialize(value) {
      return value ? 'open' : 'closed';
    },
    deserialize(value) {
      return value === 'open' ? true : false;
    }
  },
  page: {
    defaultValue: 1,
    refresh: true
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  tags: {
    defaultValue: ['Ember', 'Parachute'],
    refresh: true,
    serialize(value) {
      return value.toString();
    },
    deserialize(value = '') {
      return emberArray(value.split(','));
    }
  }
});

export default Controller.extend(queryParams.Mixin, {
  queryParamsChanged: or('queryParamsState.{page,search,tags}.changed'),

  setup({ queryParams }) {
    if (queryParams.parachuteOpen) {
      this.get('fetchModel').perform();
    }
  },

  reset(_, isExiting) {
    if (isExiting) {
      this.resetQueryParams();
    }
  },

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
      this.resetQueryParams();
    },

    setDefaults() {
      ['search', 'page', 'tags'].forEach((key) => {
        let value = (key === 'tags') ? this.get(key).concat() : this.get(key);
        this.setDefaultQueryParamValue(key, value);
      });
    }
  }
});
