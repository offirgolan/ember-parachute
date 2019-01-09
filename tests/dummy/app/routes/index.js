import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';

export default Route.extend({
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
