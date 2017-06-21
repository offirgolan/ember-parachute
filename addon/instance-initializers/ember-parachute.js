import Ember from 'ember';
import QueryParams from '../query-params';
import QueryParamsChangeEvent from '../-private/query-param-change-event';
import lookupController from '../utils/lookup-controller';

const {
  run,
  assign,
  canInvoke,
  tryInvoke,
  sendEvent
} = Ember;

export function initialize(/* application */) {
  Ember.Route.reopen({
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

        if (canInvoke(queryParam, 'serialize')) {
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

        if (canInvoke(queryParam, 'deserialize')) {
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
     * @returns {void}
     */
    _scheduleParachuteChangeEvent(routeName, controller, changed = {}) {
      run.schedule('afterRender', this, () => {
        let changeEvent = new QueryParamsChangeEvent(routeName, controller, changed);

        tryInvoke(controller, 'queryParamsDidChange', [changeEvent]);
        sendEvent(controller, 'queryParamsDidChange', [changeEvent]);
      });
    },

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
        let { controller, routeName } = this;

        if (QueryParams.hasParachute(controller)) {
          this._scheduleParachuteChangeEvent(routeName, controller, assign({}, changed, removed));
        }

        return this._super(...arguments);
      }
    }
  });
}

export default {
  name: 'ember-parachute',
  initialize
};
