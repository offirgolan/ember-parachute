import { canInvoke } from './can-invoke';

export function tryInvoke(obj, methodName, args) {
  if (canInvoke(obj, methodName)) {
    let method = obj[methodName];
    return method.apply(obj, args);
  }
}
