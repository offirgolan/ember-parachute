import Ember from 'ember';
import QueryParams from '../query-params';
import lookupController from '../utils/lookup-controller';

const {
  get,
  run,
  assign,
  tryInvoke,
  sendEvent,
  A: emberArray
} = Ember;
const { keys } = Object;

export function initialize(/* application */) {
  Ember.Route.reopen({
    actions: {
      /**
       * Route hook that fires when query params are changed.
       *
       * @public
       * @param {object} [changed={}]
       * @param {object} [present={}]
       * @param {object} [removed={}]
       * @returns {any}
       */
      queryParamsDidChange(changed = {}, present = {}, removed = {}) {
        if (QueryParams.hasParachute(this.controller)) {
          this._scheduleParachuteChangeEvent(this.routeName, this.controller, assign({}, changed, removed));
        }
        return this._super(...arguments);
      }
    },

    /**
     * Serialize query param value if a given query param has a `serialize`
     * method.
     *
     * @private
     * @param {any} value
     * @param {string} urlKey
     * @returns {any}
     */
    serializeQueryParam(value, urlKey/**, defaultValueType **/) {
      let controller = lookupController(this);
      if (QueryParams.hasParachute(controller)) {
        let queryParam = QueryParams.lookupQueryParam(controller, urlKey);
        if (typeof queryParam.serialize === 'function') {
          return queryParam.serialize(value);
        }
      }
      return this._super(...arguments);
    },

    /**
     * Deserialize query param value if a given query param has a `deserialize`
     * method.
     *
     * @private
     * @param {any} value
     * @param {string} urlKey
     * @returns {any}
     */
    deserializeQueryParam(value, urlKey/**, defaultValueType **/) {
      let controller = lookupController(this);
      if (QueryParams.hasParachute(controller)) {
        let queryParam = QueryParams.lookupQueryParam(controller, urlKey);
        if (typeof queryParam.deserialize === 'function') {
          return queryParam.deserialize(value);
        }
      }
      return this._super(...arguments);
    },

    /**
     * Schedule a QueryParamChangeEvent when query params change.
     *
     * @private
     * @param {string} routeName
     * @param {Ember.Controller} controller
     * @param {object} [changed={}]
     * @returns {Void}
     */
    _scheduleParachuteChangeEvent(routeName, controller, changed = {}) {
      run.schedule('afterRender', this, () => {
        let queryParams = get(QueryParams.metaFor(controller), 'queryParams');
        let state = QueryParams.stateFor(controller);
        changed = QueryParams.normalizeNamedParams(controller, changed);

        /**
         * @typedef {Object} QueryParamsChangeEvent
         * @property {string} routeName
         * @property {object} changed
         * @property {object} queryParams
         * @property {boolean} shouldRefresh
         * @property {object} changes
         */
        /** @type {QueryParamsChangeEvent} */
        let objToPass = {
          routeName,

          // All query params that have changed from this update event
          changed,

          // All Query Params at this given moment
          queryParams: QueryParams.queryParamsFor(controller),

          // Whether or not a model refresh should occur
          shouldRefresh: emberArray(keys(changed)).any((key) => queryParams[key].refresh),

          // All query params that are not their default
          changes: keys(state).reduce((changes, key) => {
            if (state[key].changed) {
              changes[key] = state[key].value;
            }
            return changes;
          }, {})
        };

        tryInvoke(controller, 'queryParamsDidChange', [objToPass]);
        sendEvent(controller, 'queryParamsDidChange', [objToPass]);
      });
    }
  });
}

export default {
  name: 'parachute-route',
  initialize
};
