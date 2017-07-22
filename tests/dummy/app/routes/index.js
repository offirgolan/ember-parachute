import Ember from 'ember';

const {
  run,
  RSVP: { Promise }
} = Ember;

export default Ember.Route.extend({
  queryParams: {
    page: { refreshModel: true },
    tags: { refreshModel: true },
    search: { refreshModel: true }
  },

  model({ parachuteOpen }) {
    if (!parachuteOpen) {
      return new Promise(resolve => run.later(resolve, 1000));
    }
  }
});
