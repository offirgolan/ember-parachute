import Ember from 'ember';

const {
  get,
  assign,
  assert,
  isEmpty,
  tryInvoke
} = Ember;

const {
  keys
} = Object;

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this.cache = {};
  },

  /**
   * Called by the `queryParamsDidChange` route action
   *
   * @method update
   * @private
   * @param  {String} routeName
   * @param  {Ember.Controller} controller
   * @param  {Object} changed
   * @param  {Object} totalPresent
   * @param  {Object} removed
   * @return
   */
  update(routeName, controller, changed, totalPresent, removed) {
    if (!controller || controller && !get(controller, '__hasParachute__')) {
      return;
    }

    let cache = this.cache;
    let qpBuilder = controller.get('__queryParamsBuilder__');

    if (routeName && controller && !cache[routeName]) {
      cache[routeName] = {
        controller,
        qpMap: qpBuilder.options,
        queryParams: keys(qpBuilder.options).map((key) => {
          return qpBuilder.options[key];
        })
      }
    }

    this._scheduleChangeEvent(routeName, assign({}, changed, removed));
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
    let { controller, queryParams } = this.cache[routeName];

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
    let { controller, queryParams } = this.cache[routeName];

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
    let { controller } = this.cache[routeName];
    let qpBuilder = controller.get('__queryParamsBuilder__');

    assert(`[ember-parachute] The query paramter '${param}' does not exist.`, qpBuilder.options[param]);
    qpBuilder.options[param].defaultValue = defaultValue;
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
    Ember.run.schedule('render', () => {
      let { controller, queryParams } = this.cache[routeName];
      let changedKeys = keys(changes);

      // Convert the changes hash to use `key` instead of `name`
      // to keep a common convention
      let changed = queryParams.reduce((changed, data) => {
        if (changedKeys.includes(data.name)) {
          changed[data.key] = changes[data.name];
        }

        return changed;
      }, {});

      tryInvoke(controller, 'queryParamsDidChange', [{
        changed,
        queryParams: this.queryParamsFor(routeName),
        shouldRefresh: queryParams.any((data) => {
          return changedKeys.includes(data.name) && data.refresh;
        })
      }]);
    });
  }
});
