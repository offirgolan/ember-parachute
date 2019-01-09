import {
  addQueryParamFor,
  getQueryParamsFor
} from './-private/query-params-for';

export default function queryParam(qpDefinition) {
  return desc => {
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
  };
}
