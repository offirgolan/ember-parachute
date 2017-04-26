import Ember from 'ember';
import { QueryParams, Transforms } from 'ember-parachute';

const {
  inject,
  computed
} = Ember;

const queryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    normalize: Transforms.String,
    refresh: true
  },
  page: {
    defaultValue: 1,
    normalize: Transforms.Number,
    refresh: true
  },
  per: {
    defaultValue: 25,
    normalize: Transforms.Number,
    refresh: true
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

export default Ember.Controller.extend(queryParams.Mixin, {
  qp: inject.service(),

  queryParamsChanged: computed.or('queryParamsState.{page,search,direction}.changed'),

  queryParamsDidChange() {
    // console.log(...arguments);
  },

  onQueryParamsDidChange: Ember.on('queryParamsDidChange', function() {
    // console.log('onQueryParamsDidChange', ...arguments);
  }),

  actions: {
    resetAll() {
      this.get('qp').resetParamsFor('index');
    }
  }
});
