import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import { sendEvent } from '@ember/object/events';
import Ember from 'ember';
import QueryParams from '../query-params';
import ParachuteEvent from '../-private/parachute-event';
import lookupController from '../utils/lookup-controller';

const { canInvoke } = Ember;

const { keys } = Object;

export function initialize(/* application */) {
  if (Route._didInitializeParachute) {
    return;
  }

  Route.reopen({
    /**
     * Setup the route's `queryParams` map and call the `setup` hook
     * on the controller.
     *
     * @method setupController
     * @public
     * @param {Ember.Controller} controller
     * @returns {void}
     */
    setupController(controller, model, transition) {
      this._super(...arguments);

      if (QueryParams.hasParachute(controller)) {
        this._setupParachuteQueryParamsMap(controller);

        let { routeName } = this;
        let event = new ParachuteEvent(routeName, controller, {});

        // Overrides
        event.changed = event.changes;
        event.shouldRefresh = true;

        controller.setup?.(event, transition);
        sendEvent(controller, 'setup', [event, transition]);
      }
    },

    /**
     * Call the `reset` hook on the controller.
     *
     * @method resetController
     * @public
     * @param {Ember.Controller} controller
     * @param  {Boolean} isExiting
     * @returns {void}
     */
    resetController(controller, isExiting) {
      this._super(...arguments);

      if (QueryParams.hasParachute(controller)) {
        let { routeName } = this;
        let event = new ParachuteEvent(routeName, controller, {});

        // Overrides
        event.shouldRefresh = false;

        controller.reset?.(event, isExiting);
        sendEvent(controller, 'reset', [event, isExiting]);
      }
    },

    /**
     * For Engines support. `transition.routeInfos` is used to compute
     * the query params that will be injected into a controller. In lazily
     * loaded engines, routeInfos may be promises that don't contain the required
     * information. Resolve them here to guarantee parachute can properly function.
     *
     * @method deserialize
     * @param {Object} params the parameters extracted from the URL
     * @param {Transition} transition
     * @returns {Promise<any>} The model for this route
     */
    deserialize(params, transition) {
      // RouteInfo was introduced in 3.6 as a public api for HandlerInfo
      // so we should use that whenever possible.
      if (transition.routeInfos) {
        const { routeInfos } = transition;

        // Check if routeInfos have already been loaded.
        // If so, don't return a promise as it will result in
        // the loading screen/state flashing.
        if (routeInfos.every(x => x.isResolved)) {
          return this._super(params, transition);
        }

        // Save and bind the refence to the super here
        // as this._super doesn't work in callbacks
        // https://github.com/emberjs/ember.js/issues/15291
        const _super = this._super.bind(this);

        return RSVP.all(routeInfos.map(x => x.routePromise)).then(() =>
          _super(params, transition)
        );
      } else {
        const { handlerInfos } = transition;

        if (!handlerInfos.find(x => !x.handler)) {
          return this._super(params, transition);
        }

        const _super = this._super.bind(this);

        return RSVP.all(handlerInfos.map(x => x.handlerPromise)).then(() =>
          _super(params, transition)
        );
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
    serializeQueryParam(value, urlKey /**, defaultValueType **/) {
      let controller = lookupController(this);

      if (QueryParams.hasParachute(controller)) {
        let queryParam = QueryParams.lookupQueryParam(controller, urlKey);

        if (canInvoke(queryParam, 'serialize')) {
          return queryParam.serialize(value, controller);
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
    deserializeQueryParam(value, urlKey /**, defaultValueType **/) {
      let controller = lookupController(this);

      if (QueryParams.hasParachute(controller)) {
        let queryParam = QueryParams.lookupQueryParam(controller, urlKey);

        if (canInvoke(queryParam, 'deserialize')) {
          return queryParam.deserialize(value, controller);
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

        controller.queryParamsDidChange?.(event);
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
      if (!this.__hasSetupParachuteQPs) {
        let qpMap = this.get('queryParams');
        let { qpMapForRoute } = QueryParams.metaFor(controller);

        keys(qpMapForRoute).forEach(key => {
          qpMapForRoute[key] = assign({}, qpMapForRoute[key], qpMap[key]);
        });

        this.set('queryParams', qpMapForRoute);
        this.__hasSetupParachuteQPs = true;
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
      queryParamsDidChange(changed = {}, _, removed = {}) {
        let { controller, routeName } = this;

        if (QueryParams.hasParachute(controller)) {
          this._scheduleParachuteChangeEvent(
            routeName,
            controller,
            assign({}, changed, removed)
          );
        }

        return this._super(...arguments);
      }
    }
  });

  Route.reopenClass({ _didInitializeParachute: true });
}

export default {
  name: 'ember-parachute',
  initialize
};
