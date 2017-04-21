import Ember from 'ember';
import normalizeNamedParams from '../utils/normalized-named-params';
import { HAS_PARACHUTE, QP_BUILDER } from '../-private/symbols';

const {
  get,
  assign,
  assert,
  isEmpty,
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
  update(routeName, controller, changed, totalPresent, removed) {
    if (this._hasParachute(controller)) {
      this._scheduleChangeEvent(routeName, assign({}, changed, removed), totalPresent);
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
    let { controller, queryParamsArray } = this.cacheFor(routeName);

    return queryParamsArray.reduce((qps, qp) => {
      qps[qp.key] = qp.value(controller);
      return qps;
    }, {});
  },

  /**
   * Reset all or given params to their default value
   *
   * @method resetParams
   * @public
   * @param  {String} routeName
   * @param  {...string} params
   */
  resetParams(routeName, ...params) {
    let { controller, queryParamsArray } = this.cacheFor(routeName);

    let defaults = queryParamsArray.reduce((defaults, qp) => {
      if (isEmpty(params) || params.includes(qp.key)) {
        defaults[qp.key] = qp.defaultValue;
      }
      return defaults;
    }, {});

    controller.setProperties(defaults);
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
    let { controller } = this.cacheFor(routeName);
    let qpBuilder = controller.get(QP_BUILDER);
    let queryParam = qpBuilder.queryParams[param];

    assert(`[ember-parachute] The query paramater '${param}' does not exist.`, queryParam);
    queryParam.defaultValue = defaultValue;
  },

  /**
   * Get the cache for a given route name.
   * If it doesnt exist, then create it (if possible).
   *
   * @method cacheFor
   * @private
   * @param  {String} routeName
   * @return {Object}
   */
  cacheFor(routeName) {
    let cache = this._cache;

    if (!cache[routeName]) {
      let controller = this._lookupController(routeName);

      assert(`[ember-parachute] Could not access the controller for the route '${routeName}'.`, isPresent(controller));
      assert(`[ember-parachute] The controller for the route '${routeName}' is not set up with ember-parachute.`, this._hasParachute(controller));

      let qpBuilder = get(controller, QP_BUILDER);

      cache[routeName] = {
        controller,
        queryParams: qpBuilder.queryParams,
        queryParamsArray: emberArray(keys(qpBuilder.queryParams).map((key) => {
          return qpBuilder.queryParams[key];
        }))
      }
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
  _scheduleChangeEvent(routeName, changes = {}, present = {}) {
    Ember.run.schedule('afterRender', () => {
      let { controller, queryParamsArray } = this.cacheFor(routeName);
      let changedKeys = keys(changes);

      let objToPass = {
        routeName,
        changed: normalizeNamedParams(changes, queryParamsArray),
        present: normalizeNamedParams(present, queryParamsArray),
        queryParams: this.queryParamsFor(routeName),
        shouldRefresh: queryParamsArray.any((qp) => {
          return changedKeys.includes(qp.name) && qp.refresh;
        })
      };

      tryInvoke(controller, 'queryParamsDidChange', [ objToPass ]);
      sendEvent(controller, 'queryParamsDidChange', [ objToPass ]);
    });
  },

  /**
   * Check if the given controller has ember-parachute mixed in.
   *
   * @method _hasParachute
   * @private
   * @param  {Object} controller
   * @return {Boolean}
   */
  _hasParachute(controller) {
    return controller && get(controller, HAS_PARACHUTE);
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
