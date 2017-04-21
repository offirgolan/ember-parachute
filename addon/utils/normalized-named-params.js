/*
  Convert the a QP object to use `key` instead of `name`
  to keep a common convention.

  ex) { key: 'sortDirection', name: 'sort_direction' }
      We want yo use `key` since `name` is just a sort of display value.
 */

/**
 * Convert the a QP object to use `key` instead of `name`
 * to keep a common convention.
 *
 * ex) { key: 'sortDirection', name: 'sort_direction' }
 *     We want yo use `key` since `name` is just a sort of display value.
 *
 * @method normalizeNamedParams
 * @public
 * @param  {Object} o
 * @param  {Array} qp
 * @return {Object}
 */
 export default function normalizeNamedParams(o, qp) {
   return qp.reduce((ko, data) => {
     if (o[data.name]) {
       ko[data.key] = o[data.name];
     }
     return ko;
   }, {});
 }
