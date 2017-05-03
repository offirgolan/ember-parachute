import Ember from 'ember';
import { HAS_PARACHUTE, PARACHUTE_META } from './-private/symbols';
import ParachuteMetaFor from './-private/meta';
import queryParamsStateFor from './-private/state';
import includes from './utils/includes';

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
const { keys } = Object;

/**
 * Query Params class.
 *
 * @export
 * @class QueryParams
 */
export default class QueryParams {
  /**
   * @method constructor
   * @constructor
   * @public
   * @returns {QueryParams}
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
   * @returns {QueryParams}
   */
  extend() {
    return new QueryParams(this.queryParams, ...arguments);
  }

  /**
   * Get the meta object for the given controller
   *
   * @method metaFor
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @returns {Ember.Object}
   */
  static metaFor(controller) {
    assert(`[ember-parachute] The controller '${controller}' is not set up with ember-parachute.`, this.hasParachute(controller));
    return get(controller, PARACHUTE_META);
  }

  /**
   * Check if the given controller has ember-parachute mixed in.
   *
   * @method _hasParachute
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @returns {boolean}
   */
  static hasParachute(controller) {
    return controller && get(controller, HAS_PARACHUTE);
  }

  /**
   * Convert the a QP object to use `key` instead of `as`
   * to keep a common convention.
   *
   * ex) { key: 'sortDirection', as: 'sort_direction' }
   *     We want to use `key` since `as` is just a sort of display value.
   *
   * @method normalizeNamedParams
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @param  {object} [params={}]
   * @returns {object}
   */
  static normalizeNamedParams(controller, params = {}) {
    let queryParamsArray = get(this.metaFor(controller), 'queryParamsArray');
    return queryParamsArray.reduce((ko, p) => {
      ko[p.key] = params[p.as];
      return ko;
    }, {});
  }

  /**
   * Returns a query param based on a urlKey.
   *
   * @method lookupQueryParam
   * @public
   * @static
   * @param {Ember.Controller} controller
   * @param {string} urlKey
   * @returns {Object}
   *
   * @memberof QueryParams
   */
  static lookupQueryParam(controller, urlKey) {
    let queryParamsArray = get(this.metaFor(controller), 'queryParamsArray');
    return queryParamsArray.findBy('as', urlKey);
  }

  /**
   * Generate a `key`:`value` pair object for all the query params
   *
   * @method queryParamsFor
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @returns {object}
   */
  static queryParamsFor(controller) {
    let queryParamsArray = get(this.metaFor(controller), 'queryParamsArray');
    return queryParamsArray.reduce((qps, qp) => {
      qps[qp.key] = qp.value(controller);
      return qps;
    }, {});
  }

  /**
   * Generate an object with the current state of each query param
   *
   * @method stateFor
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @returns {object}
   */
  static stateFor(controller) {
    return queryParamsStateFor(controller);
  }

  /**
   * Reset all or given params to their default value
   *
   * @method resetParamsFor
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @param  {string[]} params Array of QPs to reset. If empty, all QPs will be reset.
   */
  static resetParamsFor(controller, params = []) {
    let queryParamsArray = get(this.metaFor(controller), 'queryParamsArray');
    let defaults = queryParamsArray.reduce((defaults, qp) => {
      if (isEmpty(params) || params.indexOf(qp.key) > -1) {
        defaults[qp.key] = qp.defaultValue;
      }
      return defaults;
    }, {});
    setProperties(controller, defaults);
  }

  /**
   * Set the default value for a given param.
   *
   * @method setDefaultValue
   * @public
   * @static
   * @param  {Ember.Controller} controller
   * @param  {string} param
   * @param  {any} defaultValue
   * @returns {void}
   */
  static setDefaultValue(controller, param, defaultValue) {
    let queryParams = get(this.metaFor(controller), 'queryParams');
    assert(`[ember-parachute] The query parameter '${param}' does not exist.`, queryParams[param]);
    set(queryParams[param], 'defaultValue', defaultValue);
  }

  /**
   * Normalize the passed queryParams object and assign each key some
   * defaults.
   *
   * @method _normalizeQueryParams
   * @private
   * @param  {object} queryParams
   * @returns {object}
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
   * @param {object} queryParams
   * @returns {boolean}
   */
  _validateQueryParams(queryParams) {
    return keys(queryParams).reduce((acc, key) => {
      let queryParam = queryParams[key];
      let queryParamKeys = emberArray(keys(queryParam));
      return acc && includes(queryParamKeys, 'defaultValue');
    }, true);
  }

  /**
   * Generate the meta object for this instance's QPs
   *
   * @method generateMeta
   * @private
   * @returns {Ember.Object}
   */
  _generateMeta() {
    let queryParams = this._normalizeQueryParams(this.queryParams);
    return ParachuteMetaFor(queryParams);
  }

  /**
   * Generate a Mixin from this instance's queryParams
   *
   * @method _generateMixin
   * @private
   * @returns {Ember.Mixin}
   */
  _generateMixin() {
    let meta = this._generateMeta();
    /**
     * @typedef {Object} QueryParams
     * @property {string} key
     * @property {string} as
     * @property {"controller" | undefined} scope
     * @property {any} defaultValue
     */
    /** @type {QueryParams} */
    let queryParams = get(meta, 'queryParams');
    /** @type {QueryParams[]} */
    let queryParamsArray = get(meta, 'queryParamsArray');

    // Get all the default values for each QP `key` to be set onto the controller
    let defaultValues = queryParamsArray.reduce((defaults, { key, defaultValue }) => {
      defaults[key] = defaultValue;
      return defaults;
    }, {});

    let ControllerMixin = Mixin.create(defaultValues, {
      [HAS_PARACHUTE]: true,

      // Meta must be generated on the instance so it doesnt bleed in tests
      [PARACHUTE_META]: computed(() => this._generateMeta()).readOnly(),

      // Create the `key` to `name` mapping used by Ember to register the QPs
      queryParams: queryParamsArray.reduce((qps, { key, as, scope }) => {
        qps[key] = { as, scope };
        return qps;
      }, {}),

      // Create a CP that is a collection of all QPs and their value
      allQueryParams: computed(...keys(queryParams), function() {
        return QueryParams.queryParamsFor(this);
      }).readOnly(),

      // Create a CP that holds the state of each QP
      queryParamsState: computed(...keys(queryParams), `${PARACHUTE_META}.queryParamsArray.@each.defaultValue`, function() {
        return QueryParams.stateFor(this);
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
