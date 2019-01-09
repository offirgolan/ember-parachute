import QueryParams from '../query-params';

export default function withParachute(desc) {
  return {
    ...desc,
    finisher(klass) {
      klass.reopen(new QueryParams().Mixin);

      return klass;
    }
  };
}
