import Ember from 'ember';
import { HAS_PARACHUTE, PARACHUTE_META } from './-private/symbols';
import ParachuteMeta from './-private/parachute-meta';
import queryParamsStateFor from './-private/state';

const {
  get,
  set,
  Mixin,
  assign,
  assert,
  isEmpty,
  computed,
  isPresent,
  setProperties,
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

    // Cleanup the queryParams object. Some keys can be passed
    // as undefined via extend to nullify a QP
    queryParams = keys(queryParams).reduce((qps, key) => {
      if (isPresent(queryParams[key])) {
        qps[key] = queryParams[key];
      }
      return qps;
    }, {});

    assert('[ember-parachute] You cannot pass an empty object to the QueryParams.', queryParams && !isEmpty(keys(queryParams)));

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
   * @returns {ParachuteMeta}
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
    /** @type {ParachuteMeta} */
    let { queryParamsArray } = this.metaFor(controller);

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
    /** @type {ParachuteMeta} */
    let { queryParamsArray } = this.metaFor(controller);

    return queryParamsArray.reduce((qps, qp) => {
      qps[qp.key] = qp.value(controller);
      return qps;
    }, {}, undefined);
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
    /** @type {ParachuteMeta} */
    let { queryParamsArray } = this.metaFor(controller);
    /** @type {object} */
    let defaults = queryParamsArray.reduce((defaults, qp) => {
      if (isEmpty(params) || params.indexOf(qp.key) > -1) {
        defaults[qp.key] = qp.defaultValue;
      }
      return defaults;
    }, {}, undefined);

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
    /** @type {ParachuteMeta} */
    let { queryParams } = this.metaFor(controller);
    assert(`[ember-parachute] The query parameter '${param}' does not exist.`, queryParams[param]);
    set(queryParams[param], 'defaultValue', defaultValue);
  }

  /**
   * Generate the meta object for this instance's QPs
   *
   * @method generateMeta
   * @private
   * @returns {ParachuteMeta}
   */
  _generateMeta() {
    return new ParachuteMeta(this.queryParams);
  }

  /**
   * Generate a Mixin from this instance's queryParams
   *
   * @method _generateMixin
   * @private
   * @returns {Ember.Mixin}
   */
  _generateMixin() {
    let { queryParams, queryParamsArray } = this._generateMeta();

    // Get all the default values for each QP `key` to be set onto the controller
    /** @type {object} */
    let defaultValues = queryParamsArray.reduce((defaults, { key, defaultValue }) => {
      defaults[key] = defaultValue;
      return defaults;
    }, {}, undefined);
    /** @type {Ember.Mixin} */
    let ControllerMixin = Mixin.create(defaultValues, {
      /**
       * @private
       * @property {boolean}
       */
      [HAS_PARACHUTE]: true,

      /**
       * Meta must be generated on the instance so it doesnt bleed in tests
       *
       * @private
       * @property {Ember.ComputedProperty}
       */
      [PARACHUTE_META]: computed(() => this._generateMeta()).readOnly(),

      /**
       * Create the `key` to `name` mapping used by Ember to register the QPs
       *
       * @public
       * @property {object}
       */
      queryParams: queryParamsArray.reduce((qps, { key, as, scope }) => {
        qps[key] = { as, scope };
        return qps;
      }, {}, undefined),

      /**
       * Create a CP that is a collection of all QPs and their value
       *
       * @public
       * @property {Ember.ComputedProperty}
       */
      allQueryParams: computed(...keys(queryParams), function() {
        return QueryParams.queryParamsFor(this);
      }).readOnly(),

      /**
       * Create a CP that holds the state of each QP.
       *
       * @public
       * @property {Ember.ComputedProperty}
       */
      queryParamsState: computed(...keys(queryParams), `${PARACHUTE_META}.queryParamsArray.@each.defaultValue`, function() {
        return QueryParams.stateFor(this);
      }).readOnly(),

      /**
       * Overridable hook that fires when query params change.
       *
       * @public
       * @returns {void}
       */
      queryParamsDidChange() {},

      /**
       * Reset query params to their default value. Accepts an optional array
       * of query param keys to reset.
       *
       * @public
       * @param {string[]} [params=[]]
       * @returns {void}
       */
      resetQueryParams(params = []) {
        QueryParams.resetParamsFor(this, params);
      },

      /**
       * Update default value for a given query param.
       *
       * @param {string} key
       * @param {any} defaultValue
       * @returns {void}
       */
      setDefaultQueryParamValue(key, defaultValue) {
        QueryParams.setDefaultValue(this, key, defaultValue);
      }
    });

    ControllerMixin[NAME_KEY] = 'Parachute';

    return ControllerMixin;
  }
}
