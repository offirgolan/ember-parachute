import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

export default Ember.Route.extend({
  queryParams: {
    page: { refreshModel: true },
    search: { refreshModel: true }
  },

  fetchModel: task(function *() {
    yield timeout(1000);
  }).restartable(),

  model(params) {
    if (!params.parachuteOpen) {
      return this.get('fetchModel').perform();
    }
  }
});
