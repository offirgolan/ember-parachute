import QueryParams from '../../query-params';

const QP_MAP = new WeakMap();

export function getQueryParamsFor(klass) {
  QP_MAP.set(klass, QP_MAP.get(klass) || new QueryParams());

  return QP_MAP.get(klass);
}

export function addQueryParamFor(klass, key, definition) {
  QP_MAP.set(
    klass,
    getQueryParamsFor(klass).extend({ [key]: definition || {} })
  );
}
