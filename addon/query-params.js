import Ember from 'ember';
import { HAS_PARACHUTE,  PARACHUTE_META } from './-private/symbols';

const {
  get,
  set,
  Mixin,
  assign,
  assert,
  isEmpty,
  computed,
  setProperties,
  A: emberArray,
  NAME_KEY
} = Ember;

const {
  keys
} = Object;

export default class QueryParams {
  /**
   * @method constructor
   * @constructor
   * @public
   * @param  {...Object} queryParams
   */
  constructor() {
    let queryParams = assign({}, ...arguments);

    assert('[ember-parachute] You cannot pass an empty object to the QueryParams.', queryParams && !isEmpty(keys(queryParams)));
    assert('[ember-parachute] You must specify all required keys in your QueryParams map', this._validateQueryParams(queryParams));

    this.queryParams = queryParams;
    this.Mixin = this._generateMixin();
  }

  /**
   * Extend this QueryParams instance with the passed query paramaters
   *
   * @method extend
   * @public
   * @param  {...Object} queryParams
   */
  extend() {
    return new QueryParams(this.queryParams, ...arguments);
  }

  /**
   * Generate a `key`:`value` pair object for all the query params
   *
   * @method queryParamsFor
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @return {Object}
   */
  static queryParamsFor(controller) {
    let { queryParamsArray } = this._metaFor(controller);

    return queryParamsArray.reduce((qps, qp) => {
      qps[qp.key] = qp.value(controller);
      return qps;
    }, {});
  }

  /**
   * Generate an object with the current state of each query param
   *
   * @method queryParamsStateFor
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @return {Object}
   */
  static queryParamsStateFor(controller) {
    let { queryParamsArray } = this._metaFor(controller);

    return queryParamsArray.reduce((state, qp) => {
      let value = qp.value(controller);

      state[qp.key] = {
        value,
        defaultValue: qp.defaultValue,
        changed: JSON.stringify(value) !== JSON.stringify(qp.defaultValue)
      };
      return state;
    }, {});
  }

  /**
   * Reset all or given params to their default value
   *
   * @method resetParamsFor
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @param  {Array} params Array of QPs to reset. If empty, all QPs will be reset.
   */
  static resetParamsFor(controller, params = []) {
    let { queryParamsArray } = this._metaFor(controller);

    let defaults = queryParamsArray.reduce((defaults, qp) => {
      if (isEmpty(params) || params.indexOf(qp.key) > -1) {
        defaults[qp.key] = qp.defaultValue;
      }
      return defaults;
    }, {});

    setProperties(controller, defaults);
  }

  /**
   * Set the default value for a given param
   *
   * @method setDefaultValue
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @param  {String} param
   * @param  {*} defaultValue
   */
  static setDefaultValue(controller, param, defaultValue) {
    let { queryParams } = this._metaFor(controller);

    assert(`[ember-parachute] The query paramater '${param}' does not exist.`, queryParams[param]);
    set(queryParams[param], 'defaultValue', defaultValue);
  }

  /**
   * Get the meta object for the given controller
   *
   * @method _metaFor
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @return {Object}
   */
  static _metaFor(controller) {
    assert(`[ember-parachute] The controller '${controller}' is not set up with ember-parachute.`, this._hasParachute(controller));
    return get(controller, PARACHUTE_META);
  }

  /**
   * Check if the given controller has ember-parachute mixed in.
   *
   * @method _hasParachute
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @return {Boolean}
   */
  static _hasParachute(controller) {
    return controller && get(controller, HAS_PARACHUTE);
  }

  /**
   * Convert the a QP object to use `key` instead of `as`
   * to keep a common convention.
   *
   * ex) { key: 'sortDirection', as: 'sort_direction' }
   *     We want yo use `key` since `as` is just a sort of display value.
   *
   * @method _normalizeNamedParams
   * @private
   * @static
   * @param  {Ember.Controller} controller
   * @param  {Object} [params={}]
   * @return {Object}
   */
  static _normalizeNamedParams(controller, params = {}) {
    let { queryParamsArray } = this._metaFor(controller);

    return queryParamsArray.reduce((ko, p) => {
      if (params[p.as]) {
        ko[p.key] = params[p.as];
      }
      return ko;
    }, {});
  }

  /**
   * Normalize the passed queryParams object and assign each key some
   * defaults.
   *
   * @method _normalizeQueryParams
   * @private
   * @param  {Object} queryParams
   * @return {Object}
   */
  _normalizeQueryParams(queryParams) {
    return keys(queryParams).reduce((o, key) => {
      let queryParam = queryParams[key];

      if (queryParam && typeof queryParam === 'object') {
        o[key] = assign({
          key,
          as: key,
          refresh: false,
          value(controller) {
            return get(controller, this.key);
          }
        }, queryParam);
      }

      return o;
    }, {});
  }

  /**
   * Validates the query param map.
   *
   * @method _validateQueryParams
   * @private
   * @param {Object} queryParams
   * @return {Boolean}
   */
  _validateQueryParams(queryParams) {
    return keys(queryParams).reduce((acc, key) => {
      let queryParam = queryParams[key];
      return acc && emberArray(keys(queryParam)).includes('defaultValue');
    }, true);
  }

  /**
   * Generate the meta object for this instance's QPs
   *
   * @method generateMeta
   * @private
   * @return {Object}
   */
  _generateMeta() {
    let queryParams = this._normalizeQueryParams(this.queryParams);

    return {
      queryParams,
      queryParamsArray: emberArray(keys(queryParams).map((key) => {
        return queryParams[key];
      }))
    }
  }

  /**
   * Generate a Mixin from this instance's queryParams
   *
   * @method _generateMixin
   * @private
   * @return {Ember.Mixin}
   */
  _generateMixin() {
    let { queryParams, queryParamsArray } = this._generateMeta();

    // Get all the default values for each QP `key` to be set onto the controller
    let defaultValues = queryParamsArray.reduce((defaults, qp) => {
      if (qp.alias) {
        defaults[qp.key] = computed(qp.alias, {
          get() {
            return qp.deserialize(get(this, qp.alias));
          },
          set(key, value) {
            set(this, qp.alias, qp.serialize(value));
            return value;
          }
        })
      }
      defaults[qp.key] = qp.defaultValue;
      return defaults;
    }, {});

    let ControllerMixin = Mixin.create(defaultValues, {
      [HAS_PARACHUTE]: true,

      // Meta must be generated on the instance so it doesnt bleed in tests
      [PARACHUTE_META]: computed(() => this._generateMeta()).readOnly(),

      // Create the `key` to `name` mapping used by Ember to register the QPs
      queryParams: queryParamsArray.reduce((qps, qp) => {
        qps[qp.key] = { as: qp.as, scope: qp.scope };
        return qps;
      }, {}),

      // Create a CP that is a collection of all QPs and their value
      allQueryParams: computed(...keys(queryParams), function() {
        return QueryParams.queryParamsFor(this);
      }).readOnly(),

      // Create a CP that holds the state of each QP
      queryParamsState: computed(...keys(queryParams), `${PARACHUTE_META}.queryParamsArray.@each.defaultValue`, function() {
        return QueryParams.queryParamsStateFor(this)
      }).readOnly(),

      queryParamsDidChange() {},

      resetQueryParams(params = []) {
        QueryParams.resetParamsFor(this, params);
      },

      setDefaultQueryParamValue(key, defaultValue) {
        QueryParams.setDefaultValue(this, key, defaultValue);
      }
    });

    ControllerMixin[NAME_KEY] = 'Parachute';

    return ControllerMixin;
  }
}
