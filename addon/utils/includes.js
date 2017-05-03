/**
 * Check if values are included within an array.
 *
 * @export
 * @param {Ember.NativeArray} haystack
 * @param {any[]} args
 * @returns {boolean}
 */
export default function includes(haystack, ...args) {
  // @ts-ignore `includes` is missing from @types/ember
  let finder = haystack.includes || haystack.contains;
  return finder.apply(haystack, args);
}
