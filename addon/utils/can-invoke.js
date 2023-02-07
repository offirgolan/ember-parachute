export function canInvoke(obj, methodName) {
  return obj != null && typeof obj[methodName] === 'function';
}
