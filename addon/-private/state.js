import QueryParams from '../query-params';
import Ember from 'ember';

const {
  assert,
  isPresent,
  canInvoke
} = Ember;

/**
 * Creates QueryParamsState interface.
 *
 * @param {Ember.NativeArray} queryParamsArray
 * @param {Ember.Controller} controller
 * @returns {object}
 */
function queryParamsState(queryParamsArray, controller) {
  return queryParamsArray.reduce((state, qp) => {
    let value = qp.value(controller);
    let serializedValue = canInvoke(qp, 'serialize') ? qp.serialize(value) : value;
    let as = qp.as || qp.key;
    state[qp.key] = {
      value,
      serializedValue,
      as,
      defaultValue: qp.defaultValue,
      changed: JSON.stringify(value) !== JSON.stringify(qp.defaultValue)
    };
    return state;
  }, {}, undefined);
}

/**
 * Creates new instance of QueryParamsState for a given controller.
 *
 * @export
 * @public
 * @param {Ember.Controller} controller
 * @returns {object}
 */
export default function queryParamsStateFor(controller) {
  assert('[ember-parachute] Cannot construct query params state object without a controller', isPresent(controller));
  let { queryParamsArray } = QueryParams.metaFor(controller);
  return queryParamsState(queryParamsArray, controller);
}
