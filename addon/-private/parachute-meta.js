import Ember from 'ember';
import QueryParam from './query-param';

const {
  A: emberArray
} = Ember;

const {
  keys
} = Object;

/**
 * Meta class used by ember-parachute.
 *
 * @export
 * @class ParachuteMeta
 */
export default class ParachuteMeta {
  /**
   * Creates an instance of ParachuteMeta.
   *
   * @param {Object} [queryParams={}]
   *
   * @memberof ParachuteMeta
   */
  constructor(queryParams = {}) {
    /** @type {object} */
    this.queryParams = keys(queryParams).reduce((qps, key) => {
      qps[key] = new QueryParam(key, queryParams[key]);
      return qps;
    }, {});

    /** @type {Ember.NativeArray} */
    this.queryParamsArray = emberArray(keys(this.queryParams).map((key) => {
      return this.queryParams[key];
    }));

    /** @type {object} */
    this.qpMapForController = this.queryParamsArray.reduce((qps, { key, as, scope }) => {
      qps[key] = { as, scope };
      return qps;
    }, {});

    /** @type {object} */
    this.qpMapForRoute = this.queryParamsArray.reduce((qps, { key, replace, refreshModel }) => {
      qps[key] = { replace, refreshModel };
      return qps;
    }, {});

    /** @type {object} */
    this.defaultValues = this.queryParamsArray.reduce((defaults, { key, defaultValue }) => {
      defaults[key] = defaultValue;
      return defaults;
    }, {});
  }
}
