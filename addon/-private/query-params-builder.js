import Ember from 'ember';

const {
  get,
  Mixin,
  assign
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

    return Mixin.create(defaultValues, {
      __hasParachute__: true,
      __queryParamsBuilder__: this,
      queryParams,
      queryParamsDidChange() {}
    });
  }
}
