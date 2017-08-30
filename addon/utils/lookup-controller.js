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
    /**
     * If the controller doesnt exist, use the class proto instead. Before, we
     * would create the controller if it didnt exist which caused a lot of issues
     * (especially with authentication) due to the controller being created
     * prematurely.
     */
    let controllerName = get(route, 'controllerName') || get(route, 'routeName');
    let factory = ownerLookupFn(route).factoryFor(`controller:${controllerName}`);
    return factory.class.proto();
  }

  return controller;
}
