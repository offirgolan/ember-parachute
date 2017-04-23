import Ember from 'ember';
import { HAS_PARACHUTE, QP_BUILDER } from './symbols';

const {
  get,
  Mixin,
  assign,
  assert,
  isEmpty,
  computed,
} = Ember;

const {
  keys
} = Object;

export default class QueryParamsBuilder {
  /**
   * @method constructor
   * @constructor
   * @public
   * @param  {...Object} queryParams
   */
  constructor() {
    let queryParams = assign({}, ...arguments);

    assert('[ember-parachute] You cannot pass an empty object to the QueryParamsBuilder.', queryParams && !isEmpty(keys(queryParams)));

    this._queryParams = queryParams;
    this.queryParams = this._normalizeQueryParams(queryParams);
    this.Mixin = this._generateMixin();
  }

  /**
   * Extend this QueryParamsBuilder with the passed query paramaters
   *
   * @method extend
   * @public
   * @param  {...Object} queryParams
   */
  extend() {
    return new QueryParamsBuilder(this._queryParams, ...arguments);
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
            let value = get(controller, this.key);
            return (typeof this.normalize === 'function') ? this.normalize(value) : value;
          }
        }, queryParam);
      }

      return o;
    }, {});
  }

  /**
   * Generate a Mixin from this instance's queryParams
   *
   * @method _generateMixin
   * @private
   * @return {Ember.Mixin}
   */
  _generateMixin() {
    let queryParams = this.queryParams;

    // Create the `key` to `name` mapping used by Ember to register the QPs
    let queryParamsMap = keys(queryParams).reduce((qps, key) => {
      qps[key] = {
        as: queryParams[key].as,
        scope: queryParams[key].scope
      };

      return qps;
    }, {});

    // Get all the default values for each QP `key` to be set onto the controller
    let defaultValues = keys(queryParams).reduce((defaults, key) => {
      defaults[key] = queryParams[key].defaultValue;
      return defaults;
    }, {});

    // Create a CP that is a collection of all QPs and their value
    let allQueryParams = computed(...keys(queryParams), function() {
      return keys(queryParams).reduce((qps, key) => {
        qps[key] = queryParams[key].value(this);
        return qps;
      }, {});
    }).readOnly();

    return Mixin.create(defaultValues, {
      [HAS_PARACHUTE]: true,
      [QP_BUILDER]: this,
      allQueryParams,
      queryParams: queryParamsMap,
      queryParamsDidChange() {}
    });
  }
}
