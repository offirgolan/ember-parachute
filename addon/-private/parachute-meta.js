import { A as emberArray } from '@ember/array';
import QueryParam from './query-param';

const { keys } = Object;

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
   * @memberof ParachuteMeta
   */
  constructor(queryParams = {}) {
    this.queryParams = keys(queryParams).reduce((qps, key) => {
      qps[key] = new QueryParam(key, queryParams[key]);
      return qps;
    }, {});

    this.queryParamsArray = emberArray(
      keys(this.queryParams).map(key => {
        return this.queryParams[key];
      })
    );

    this.qpMapForController = this.queryParamsArray.reduce(
      (qps, { key, as, scope }) => {
        qps[key] = { as, scope };
        return qps;
      },
      {}
    );

    this.qpMapForRoute = this.queryParamsArray.reduce(
      (qps, { key, replace }) => {
        qps[key] = { replace };
        return qps;
      },
      {}
    );

    this.defaultValues = this.queryParamsArray.reduce(
      (defaults, { key, defaultValue }) => {
        defaults[key] = defaultValue;
        return defaults;
      },
      {}
    );
  }
}
