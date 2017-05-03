import Ember from 'ember';

const {
  get,
  computed,
  A: emberArray,
  Object: EmberObject
} = Ember;
const { keys } = Object;

/**
 * Returns list of dependent keys for a given query params object.
 *
 * @param {object} queryParams
 * @returns {string[]}
 */
function dependentKeysFor(queryParams) {
  return keys(queryParams).map((qpKey) => {
    return `queryParams.${qpKey}.{defaultValue,defaultValue.[]}`;
  });
}

/**
 * Creates parachute meta object based on query params.
 *
 * @private
 * @param {Object} queryParams
 * @returns {Ember.Object}
 */
export default function ParachuteMetaFor(queryParams) {
  return EmberObject.extend({
    queryParams,
    queryParamsArray: computed(...dependentKeysFor(queryParams), function() {
      let queryParams = get(this, 'queryParams');
      return emberArray(keys(queryParams).map((key) => {
        return queryParams[key];
      }));
    }).readOnly()
  }).create();
}
