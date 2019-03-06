import { A } from '@ember/array';
import { PARACHUTE_QPS } from 'ember-parachute/-private/symbols';
import {
  addQueryParamFor,
  getQueryParamsFor
} from './-private/query-params-for';

function createDescriptor(desc, qpDefinition) {
  qpDefinition = qpDefinition || {};

  const descriptor = {
    ...desc,
    finisher(klass) {
      addQueryParamFor(klass, desc.key, qpDefinition);
      klass.reopen(getQueryParamsFor(klass).Mixin);

      const proto = klass.proto();

      // Remove duplicate queryParams created by the multiple mixins
      if (Array.isArray(proto.queryParams)) {
        const queryParams = A([...proto.queryParams]);
        const parachuteQueryParams = queryParams.filterBy(PARACHUTE_QPS, true);

        // Keep the newest one
        parachuteQueryParams.pop();
        // Remove the old ones
        queryParams.removeObjects(parachuteQueryParams);

        proto.queryParams = queryParams.toArray();
      }

      return klass;
    }
  };

  if (desc.kind === 'field') {
    if (typeof desc.initializer === 'function') {
      qpDefinition.defaultValue = desc.initializer();
    }

    descriptor.initializer = function initializer() {
      return qpDefinition.defaultValue;
    };
  }

  return descriptor;
}

export default function queryParam(qpDefinition) {
  // Handle `@queryParam` usage
  if (`${qpDefinition}` === '[object Descriptor]') {
    return createDescriptor(qpDefinition);
  }

  // Handle `@queryParam()` usage
  return desc => createDescriptor(desc, qpDefinition);
}
