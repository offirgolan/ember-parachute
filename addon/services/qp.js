import Ember from 'ember';
import normalizeNamedParams from '../utils/normalized-named-params';
import QueryParams from '../query-params';

const {
  run,
  assign,
  assert,
  isPresent,
  tryInvoke,
  getOwner,
  sendEvent,
  A: emberArray
} = Ember;

const {
  keys
} = Object;

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this._cache = {};
  },

  /**
   * Called by the `queryParamsDidChange` route action
   *
   * @method update
   * @private
   * @param  {String} routeName
   * @param  {Object} changed
   * @param  {Object} totalPresent
   * @param  {Object} removed
   * @return
   */
  update(routeName, controller, changed = {}, present = {}, removed = {}) {
    if (QueryParams._hasParachute(controller)) {
      this._scheduleChangeEvent(routeName, assign({}, changed, removed));
    }
  },

  /**
   * Get all query params for the given route name
   *
   * @method queryParamsFor
   * @public
   * @param  {String} routeName
   * @return {Object}
   */
  queryParamsFor(routeName) {
    let { controller } = this._cacheFor(routeName);
    return QueryParams.queryParamsFor(controller);
  },

  /**
   * Get all query params state for the given route name
   *
   * @method queryParamsStateFor
   * @public
   * @param  {String} routeName
   * @return {Object}
   */
  queryParamsStateFor(routeName) {
    let { controller } = this._cacheFor(routeName);
    return QueryParams.queryParamsStateFor(controller);
  },

  /**
   * Reset all or given params to their default value
   *
   * @method resetParamsFor
   * @public
   * @param  {String} routeName
   * @param  {Array} params Array of QPs to reset. If empty, all QPs will be reset.
   */
  resetParamsFor(routeName, params = []) {
    let { controller } = this._cacheFor(routeName);
    return QueryParams.resetParamsFor(controller, params);
  },

  /**
   * Set the default value for a given param
   *
   * @method setDefaultValue
   * @public
   * @param  {String} routeName
   * @param  {String} param
   * @param  {*} defaultValue
   */
  setDefaultValue(routeName, param, defaultValue) {
    let { controller } = this._cacheFor(routeName);
    return QueryParams.setDefaultValue(controller, param, defaultValue);
  },

  /**
   * Get the cache for a given route name.
   * If it doesnt exist, then create it (if possible).
   *
   * @method _cacheFor
   * @private
   * @param  {String} routeName
   * @return {Object}
   */
  _cacheFor(routeName) {
    let cache = this._cache;

    if (!cache[routeName]) {
      let controller = this._lookupController(routeName);

      assert(`[ember-parachute] Could not access the controller for the route '${routeName}'.`, isPresent(controller));

      let { queryParams, queryParamsArray } = QueryParams._metaFor(controller);
      cache[routeName] = { controller, queryParams, queryParamsArray }
    }

    return cache[routeName];
  },

  /**
   * Schedule an invokation of `queryParamsDidChange` on the controller
   *
   * @method _scheduleChangeEvent
   * @private
   * @param  {String} routeName
   * @param  {Object} changes
   * @param  {Object} present
   * @return
   */
  _scheduleChangeEvent(routeName, changed = {}) {
    run.schedule('afterRender', () => {
      let { controller, queryParams, queryParamsArray } = this._cacheFor(routeName);
      let state = this.queryParamsStateFor(routeName);
      changed = normalizeNamedParams(changed, queryParamsArray);

      let objToPass = {
        routeName,

        // All query params that have changed from this update event
        changed,

        // All Query Params at this given moment
        queryParams: this.queryParamsFor(routeName),

        // Whether or not a model refresh should occur
        shouldRefresh: emberArray(keys(changed)).any((key) => queryParams[key].refresh),

        // All query params that are not their default
        changes: keys(state).reduce((changes, key) => {
          if (state[key].changed) {
            changes[key] = state[key].value;
          }
          return changes;
        }, {})
      };

      tryInvoke(controller, 'queryParamsDidChange', [ objToPass ]);
      sendEvent(controller, 'queryParamsDidChange', [ objToPass ]);
    });
  },

  /**
   * Lookup the controller for a given route name
   *
   * @method _lookupController
   * @private
   * @param  {String} routeName
   * @return {Ember.Controller}
   */
  _lookupController(routeName) {
    return getOwner(this).lookup(`controller:${routeName}`);
  },
});
