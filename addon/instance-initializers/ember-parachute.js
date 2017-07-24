import Ember from 'ember';
import QueryParams from '../query-params';
import ParachuteEvent from '../-private/parachute-event';
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
    setupController(controller) {
      this._super(...arguments);

      if (QueryParams.hasParachute(controller)) {
        this._setupParachuteQueryParamsMap(controller);

        let { routeName } = this;
        let event = new ParachuteEvent(routeName, controller, {});

        // Overrides
        event.changed = event.changes;
        event.shouldRefresh = true;

        tryInvoke(controller, 'setup', [event]);
        sendEvent(controller, 'setup', [event]);
      }
    },

    resetController(controller, isExiting) {
      this._super(...arguments);

      if (QueryParams.hasParachute(controller)) {
        let { routeName } = this;
        let event = new ParachuteEvent(routeName, controller, {});

        // Overrides
        event.shouldRefresh = false;

        tryInvoke(controller, 'reset', [event, isExiting]);
        sendEvent(controller, 'reset', [event, isExiting]);
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
        let event = new ParachuteEvent(routeName, controller, changed);

        tryInvoke(controller, 'queryParamsDidChange', [event]);
        sendEvent(controller, 'queryParamsDidChange', [event]);
      });
    },

    /**
     * Setup the route's `queryParams` map if it doesnt already exist from
     * the controller's Parachute meta.
     *
     * @method _setupParachuteQueryParamsMap
     * @private
     * @param {Ember.Controller} controller
     * @returns {void}
     */
    _setupParachuteQueryParamsMap(controller) {
      if (!this.get('queryParams')) {
        let { qpMapForRoute } = QueryParams.metaFor(controller);
        this.set('queryParams', qpMapForRoute);
      }
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
