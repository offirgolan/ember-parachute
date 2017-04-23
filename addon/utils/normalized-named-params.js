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
   return qp.reduce((ko, p) => {
     if (o[p.as]) {
       ko[p.key] = o[p.as];
     }
     return ko;
   }, {});
 }
