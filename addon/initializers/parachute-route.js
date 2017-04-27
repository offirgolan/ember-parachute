import Ember from 'ember';
import QueryParams from '../query-params';

const {
  run,
  assign,
  tryInvoke,
  sendEvent,
  A: emberArray
} = Ember;

const {
  keys
} = Object;

export function initialize(/* application */) {
  Ember.Route.reopen({
    actions: {
      queryParamsDidChange(changed = {}, present = {}, removed = {}) {
        if (QueryParams._hasParachute(this.controller)) {
          this._scheduleParachuteChangeEvent(this.routeName, this.controller, assign({}, changed, removed));
        }

        return this._super(...arguments);
      }
    },

    _scheduleParachuteChangeEvent(routeName, controller, changed = {}) {
      run.schedule('afterRender', () => {
        let { queryParams } = QueryParams._metaFor(controller);
        let state = QueryParams.queryParamsStateFor(controller);
        changed = QueryParams._normalizeNamedParams(controller, changed);

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

        tryInvoke(controller, 'queryParamsDidChange', [ objToPass ]);
        sendEvent(controller, 'queryParamsDidChange', [ objToPass ]);
      });
    }
  });
}

export default {
  name: 'parachute-route',
  initialize
};
