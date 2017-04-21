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
  constructor(queryParams = {}) {
    assert('[ember-parachute] You cannot pass an empty object to the query params builder.', queryParams && !isEmpty(keys(queryParams)));

    this._queryParams = queryParams;
    this.queryParams = this._normalizeQueryParams(queryParams);
    this.Mixin = this._generateMixin();
  }

  extend() {
    return new QueryParamsBuilder(assign({}, this._queryParams, ...arguments));
  }

  _normalizeQueryParams(queryParams) {
    return keys(queryParams).reduce((o, key) => {
      let queryParam = queryParams[key];
      let defaults = {
        key,
        name: key,
        refresh: false,
        value(controller) {
          let value = get(controller, this.key);
          return (typeof this.normalize === 'function') ? this.normalize(value) : value;
        }
      };

      assert(`[ember-parachute] The query paramater ${key} must specify an object.`, queryParam && typeof queryParam === 'object');

      o[key] = assign(defaults, queryParam);

      return o;
    }, {});
  }

  _generateMixin() {
    let queryParams = this.queryParams;

    // Create the `key` to `name` mapping used by Ember to register the QPs
    let queryParamsMap = keys(queryParams).reduce((qps, key) => {
      qps[key] = queryParams[key].name || key;
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
