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
  constructor(options = {}) {
    this.options = this._normalizeOptions(options);
    this.Mixin = this._generateMixin();
  }

  extend(options = {}) {
    return new QueryParamsBuilder(assign({}, this.options, options));
  }

  _normalizeOptions(options) {
    return keys(options).reduce((o, key) => {
      let defaults = {
        key,
        name: key,
        refresh: false,
        value(controller) {
          let value = get(controller, this.key);
          return (typeof this.normalize === 'function') ? this.normalize(value) : value;
        }
      };

      o[key] = assign(defaults, options[key]);

      return o;
    }, {});
  }

  _generateMixin() {
    let options = this.options;
    let queryParams = keys(options).reduce((qps, key) => {
      qps[key] = options[key].name || key;
      return qps;
    }, {});

    let defaultValues = keys(options).reduce((defaults, key) => {
      defaults[key] = options[key].defaultValue;
      return defaults;
    }, {});

    let allQueryParams = computed(...keys(options), function() {
      return keys(options).reduce((qps, key) => {
        qps[key] = options[key].value(this);
        return qps;
      }, {});
    }).readOnly();

    return Mixin.create(defaultValues, {
      [HAS_PARACHUTE]: true,
      [QP_BUILDER]: this,
      queryParams,
      allQueryParams,
      queryParamsDidChange() {}
    });
  }
}
