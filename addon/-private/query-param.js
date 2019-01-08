import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent, isEmpty } from '@ember/utils';
import Ember from 'ember';

const {
  canInvoke
} = Ember;

const {
  keys
} = Object;

const REQUIRED_PROPS = [ 'defaultValue' ];

/**
 * Normalized query param object.
 *
 * @export
 * @class QueryParam
 */
export default class QueryParam {
  constructor(key, options = {}) {
    assert(`[ember-parachute] You must specify a key to the QueryParam Class`, isPresent(key));
    assert(`[ember-parachute] You must specify all required fields for the query param: '${key}'`, this._validateOptions(options));

    /** @type {string} */
    this.key = key;

    /** @type {string} */
    this.as = options.as || key;

    /** @type {"controller" | undefined} */
    this.scope = options.scope;

    /** @type {any} */
    this.defaultValue = options.defaultValue;

    /** @type {boolean} */
    this.refresh = Boolean(options.refresh);

    /** @type {boolean} */
    this.replace = Boolean(options.replace);

    /** @type {function(any): any} */
    this.serialize = options.serialize;

    /** @type {function(any): any} */
    this.deserialize = options.deserialize;
  }

  /**
   * Current query param value.
   *
   * @param {Ember.Controller} controller
   * @returns {any}
   *
   * @memberof QueryParam
   */
  value(controller) {
    return get(controller, this.key);
  }

  /**
   * Current query param serialized value.
   *
   * @param {Ember.Controller} controller
   * @returns {any}
   *
   * @memberof QueryParam
   */
  serializedValue(controller) {
    const value = this.value(controller);
    return canInvoke(this, 'serialize') ? this.serialize(value, controller) : value;
  }

  /**
   * String representation of the query param object.
   *
   * @returns {string}
   *
   * @memberof QueryParam
   */
  toString() {
    return `QueryParam<${this.key}>`;
  }

  /**
   * Validate required options.
   *
   * @private
   * @param {object} options
   * @returns {boolean}
   *
   * @memberof QueryParam
   */
  _validateOptions(options) {
    let optionKeys = keys(options);
    return !isEmpty(optionKeys) && REQUIRED_PROPS.every(p => optionKeys.indexOf(p) > -1);
  }
}
