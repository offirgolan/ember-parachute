import Controller from '@ember/controller';
import { A } from '@ember/array';
import { queryParam } from 'ember-parachute/decorators';
import { timeout } from 'ember-concurrency';
import { action } from '@ember-decorators/object';
import { or } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency-decorators';

export default class IndexController extends Controller {
  @queryParam({
    as: 'parachute',
    serialize(value) {
      return value ? 'open' : 'closed';
    },
    deserialize(value) {
      return value === 'open' ? true : false;
    }
  })
  parachuteOpen = true;

  @queryParam({ refresh: true }) page = 1;

  @queryParam({ refresh: true }) search = '';

  @queryParam({
    refresh: true,
    serialize(value = '') {
      return value.toString();
    },
    deserialize(value = '') {
      return value.split(',');
    }
  })
  tags = ['Ember', 'Parachute'];

  @or('queryParamsState.{page,search,tags}.changed') queryParamsChanged;

  setup({ queryParams }) {
    if (queryParams.parachuteOpen) {
      this.get('fetchModel').perform();
    }
  }

  reset(_, isExiting) {
    if (isExiting) {
      this.resetQueryParams();
    }
  }

  queryParamsDidChange({ shouldRefresh, queryParams }) {
    if (shouldRefresh && queryParams.parachuteOpen) {
      this.get('fetchModel').perform();
    }
  }

  @task({ restartable: true })
  *fetchModel() {
    yield timeout(1000);
  }

  @action
  addTag(tag) {
    A(this.tags).addObject(tag);
  }

  @action
  removeTag(tag) {
    A(this.tags).removeObject(tag);
  }

  @action
  resetAll() {
    this.resetQueryParams();
  }

  @action
  setDefaults() {
    ['search', 'page', 'tags'].forEach(key => {
      let value = key === 'tags' ? this.get(key).concat() : this.get(key);
      this.setDefaultQueryParamValue(key, value);
    });
  }
}
