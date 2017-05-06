import Ember from 'ember';
import QueryParams from '../query-params';

const {
  canInvoke,
  A: emberArray
} = Ember;

const {
  keys
} = Object;

 /**
 * @property {string} routeName
 * @property {object} changed
 * @property {object} queryParams
 * @property {boolean} shouldRefresh
 * @property {object} changes
 */
export default class QueryParamsChangeEvent {
  constructor(routeName, controller, changed = {}) {
    let { queryParams, queryParamsArray } = QueryParams.metaFor(controller);
    let state = QueryParams.stateFor(controller);

    this.routeName = routeName;

    // All query params that have changed from this update event
    this.changed = queryParamsArray.reduce((changedParams, qp) => {
      if (changed[qp.as]) {
        changedParams[qp.key] = canInvoke(qp, 'deserialize') ? qp.deserialize(changed[qp.as]) : changed[qp.as];
      }
      return changedParams;
    }, {});

    // All Query Params at this given moment
    this.queryParams = QueryParams.queryParamsFor(controller);

    // Whether or not a model refresh should occur
    this.shouldRefresh = emberArray(keys(this.changed)).any((key) => queryParams[key].refresh)

    // All query params that are not their default
    this.changes = keys(state).reduce((changes, key) => {
      if (state[key].changed) {
        changes[key] = state[key].value;
      }
      return changes;
    }, {});
  }
}
