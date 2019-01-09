import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';
import Ember from 'ember';

const { canInvoke } = Ember;

/**
 * Normalized query param object.
 *
 * @export
 * @class QueryParam
 */
export default class QueryParam {
  constructor(key, options = {}) {
    assert(
      `[ember-parachute] You must specify a key to the QueryParam Class`,
      isPresent(key)
    );

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
    return canInvoke(this, 'serialize')
      ? this.serialize(value, controller)
      : value;
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
}
