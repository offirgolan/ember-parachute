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
