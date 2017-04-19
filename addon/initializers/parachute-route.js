import Ember from 'ember';

const {
  inject: { service }
} = Ember;

export function initialize(/* application */) {
  Ember.Route.reopen({
    qp: service(),

    actions: {
      queryParamsDidChange() {
        this.get('qp').update(this.routeName, this.controller, ...arguments);
        return this._super(...arguments);
      }
    }
  });
}

export default {
  name: 'parachute-route',
  initialize
};
