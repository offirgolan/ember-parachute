import Route from '@ember/routing/route';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';

export default Route.extend({
  queryParams: {
    page: { refreshModel: true },
    tags: { refreshModel: true },
    search: { refreshModel: true }
  },

  model({ parachuteOpen }) {
    if (!parachuteOpen) {
      return new Promise(resolve => later(resolve, 1000));
    }
  }
});
