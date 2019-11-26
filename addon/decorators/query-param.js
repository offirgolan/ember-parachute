import { A } from '@ember/array';
import { PARACHUTE_QPS } from 'ember-parachute/-private/symbols';
import {
  addQueryParamFor,
  getQueryParamsFor
} from './-private/query-params-for';
import { decoratorWithParams } from '@ember-decorators/utils/decorator';

export const queryParam = decoratorWithParams((target, key, desc, params) => {
  const qpDefinition = params ? params[0] : {};

  if (typeof desc.initializer === 'function') {
    qpDefinition.defaultValue = desc.initializer();
  }

  desc.initializer = function initializer() {
    return qpDefinition.defaultValue;
  };

  addQueryParamFor(target, key, qpDefinition);
  target.reopen(getQueryParamsFor(target).Mixin);

  // Remove duplicate queryParams created by the multiple mixins
  if (Array.isArray(target.queryParams)) {
    const queryParams = A([...target.queryParams]);
    const parachuteQueryParams = queryParams.filterBy(PARACHUTE_QPS, true);

    // Keep the newest one
    parachuteQueryParams.pop();
    // Remove the old ones
    queryParams.removeObjects(parachuteQueryParams);

    target.queryParams = queryParams.toArray();
  }
});

export default queryParam;
