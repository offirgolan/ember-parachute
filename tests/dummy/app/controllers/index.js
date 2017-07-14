import Ember from 'ember';
import QueryParams from 'ember-parachute';
import { task, timeout } from 'ember-concurrency';

const {
  computed,
  A: emberArray
} = Ember;

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
      if (!this.get('shouldSerialize')) {
        return value;
      }
      return value.toString();
    },
    deserialize(value = '') {
      if (!this.get('shouldSerialize')) {
        return value;
      }
      return emberArray(value.split(','));
    }
  }
});

export default Ember.Controller.extend(queryParams.Mixin, {
  shouldSerialize: true,
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
