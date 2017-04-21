import Ember from 'ember';
import { HAS_PARACHUTE, QP_BUILDER } from './symbols';

const {
  get,
  Mixin,
  assign,
  computed
} = Ember;

const {
  keys
} = Object;

export default class QueryParamsBuilder {
  constructor(queryParams = {}) {
    this.queryParams = this._normalizeOptions(queryParams);
    this.Mixin = this._generateMixin();
  }

  extend(queryParams = {}) {
    return new QueryParamsBuilder(assign({}, this.queryParams, queryParams));
  }

  _normalizeOptions(queryParams) {
    return keys(queryParams).reduce((o, key) => {
      let defaults = {
        key,
        name: key,
        refresh: false,
        value(controller) {
          let value = get(controller, this.key);
          return (typeof this.normalize === 'function') ? this.normalize(value) : value;
        }
      };

      o[key] = assign(defaults, queryParams[key]);

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
