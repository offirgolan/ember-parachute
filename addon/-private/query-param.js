import Ember from 'ember';

const {
  get,
  assert,
  isEmpty,
  isPresent
} = Ember;

const {
  keys
} = Object;

const REQUIRED_PROPS = [ 'defaultValue' ];

/**
 * @property {String} key
 * @property {String} as
 * @property {Boolean} refresh
 * @property {"controller" | undefined} scope
 * @property {any} defaultValue
 * @property {Function} serialize
 * @property {Function} deserialize
 */
export default class QueryParam {
  constructor(key, options = {}) {
    assert(`[ember-parachute] You must specify a key to the QueryParam Class`, isPresent(key));
    assert(`[ember-parachute] You must specify all required fields for the query param: '${key}'`, this._validateOptions(options));

    this.key = key;
    this.as = options.as || key;
    this.scope = options.scope;
    this.defaultValue = options.defaultValue;
    this.refresh = Boolean(options.refresh);
    this.serialize = options.serialize;
    this.deserialize = options.deserialize;
  }

  value(controller) {
    return get(controller, this.key);
  }

  toString() {
    return `QueryParam<${this.key}>`;
  }

  _validateOptions(options) {
    let optionKeys = keys(options);
    return !isEmpty(optionKeys) && REQUIRED_PROPS.every(p => optionKeys.indexOf(p) > -1);
  }
}
