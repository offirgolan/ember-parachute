import Ember from 'ember';

const { get, getOwner } = Ember;

/**
 * Lookup controller on route.
 *
 * @export
 * @param {Ember.Route} route
 * @param {function(any): any} [ownerLookupFn=getOwner]
 * @returns {Ember.Controller}
 */
export default function lookupController(route, ownerLookupFn = getOwner) {
  let controller = get(route, 'controller');

  if (!controller) {
    let factory = ownerLookupFn(route).factoryFor(`controller:${get(route, 'routeName')}`);
    return factory.class.proto();
  }

  return controller;
}
