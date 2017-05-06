import Ember from 'ember';
import QueryParam from './query-param';

const {
  A: emberArray
} = Ember;

const {
  keys
} = Object;

export default class ParachuteMeta {
  constructor(queryParams = {}) {
    this.queryParams = keys(queryParams).reduce((qps, key) => {
      qps[key] = new QueryParam(key, queryParams[key]);
      return qps;
    }, {});

    this.queryParamsArray = emberArray(keys(this.queryParams).map((key) => {
      return this.queryParams[key];
    }));
  }
}
