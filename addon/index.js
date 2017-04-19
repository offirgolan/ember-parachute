import QueryParamsBuilder from './-private/query-params-builder';
import Transforms from './-private/transforms';

function buildQueryParams(options = {}) {
  return new QueryParamsBuilder(options);
}

export { buildQueryParams, Transforms };
