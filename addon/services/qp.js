import Ember from 'ember';
import { HAS_PARACHUTE, QP_BUILDER } from '../-private/symbols';

const {
  get,
  assign,
  assert,
  isEmpty,
  isPresent,
  tryInvoke,
  getOwner
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
    let { controller, queryParams } = this.cacheFor(routeName);

    return queryParams.reduce((qps, data) => {
      qps[data.key] = data.value(controller);
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
    let { controller, queryParams } = this.cacheFor(routeName);

    let defaults = queryParams.reduce((defaults, data) => {
      if (isEmpty(params) || params.includes(data.key)) {
        defaults[data.key] = data.defaultValue;
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

    assert(`[ember-parachute] The query paramater '${param}' does not exist.`, qpBuilder.options[param]);
    qpBuilder.options[param].defaultValue = defaultValue;
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
        qpMap: qpBuilder.options,
        queryParams: keys(qpBuilder.options).map((key) => {
          return qpBuilder.options[key];
        })
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
   * @param  {Object} changed
   * @param  {Object} removed
   * @return
   */
  _scheduleChangeEvent(routeName, changes) {
    Ember.run.schedule('afterRender', () => {
      let { controller, queryParams } = this.cacheFor(routeName);
      let changedKeys = keys(changes);

      /*
        Convert the changes hash to use `key` instead of `name`
        to keep a common convention.

        ex) { key: 'sortDirection', name: 'sort_direction' }
            We use `key` everywhere but the changes object uses `name`.
       */
      let changed = queryParams.reduce((changed, data) => {
        if (changedKeys.includes(data.name)) {
          changed[data.key] = changes[data.name];
        }

        return changed;
      }, {});

      tryInvoke(controller, 'queryParamsDidChange', [{
        routeName,
        changed,
        queryParams: this.queryParamsFor(routeName),
        shouldRefresh: queryParams.any((data) => {
          return changedKeys.includes(data.name) && data.refresh;
        })
      }]);
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
