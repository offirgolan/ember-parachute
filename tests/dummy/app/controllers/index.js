import Ember from 'ember';
import { QueryParamsBuilder, Transforms } from 'ember-parachute';

const QueryParams = new QueryParamsBuilder({
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

export default Ember.Controller.extend(QueryParams.Mixin, {
  queryParamsDidChange() {
    // console.log(...arguments);
  },

  onQueryParamsDidChange: Ember.on('queryParamsDidChange', function() {
    // console.log('onQueryParamsDidChange', ...arguments);
  })
});
