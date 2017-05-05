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
  return route.controller || ownerLookupFn(route).lookup(`controller:${get(route, 'routeName')}`);
}
