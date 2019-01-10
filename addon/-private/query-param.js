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

    this.key = key;
    this.as = options.as || key;
    this.scope = options.scope;
    this.defaultValue = options.defaultValue;
    this.refresh = Boolean(options.refresh);
    this.replace = Boolean(options.replace);
    this.serialize = options.serialize;
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
