import QueryParams from '../query-params';
import { decoratorWithParams } from '@ember-decorators/utils/decorator';

export const withParachute = decoratorWithParams(target => {
  target.reopen(new QueryParams().Mixin);

  return target;
});

export default withParachute;
