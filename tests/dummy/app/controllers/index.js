import Ember from 'ember';
import QueryParams from 'ember-parachute';

const {
  inject,
  computed
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
  filters: {
    defaultValue: [ 'a', 'b', 'c' ]
  }
});

export default Ember.Controller.extend(queryParams.Mixin, {
  qp: inject.service(),

  queryParamsChanged: computed.or('queryParamsState.{page,search,direction,filters}.changed'),

  queryParamsDidChange() {
    // console.log(...arguments);
  },

  onQueryParamsDidChange: Ember.on('queryParamsDidChange', function() {
    // console.log('onQueryParamsDidChange', ...arguments);
  }),

  actions: {
    addFilter() {
      this.get('filters').addObject('d');
    },

    resetAll() {
      this.get('qp').resetParamsFor('index');
    }
  }
});
