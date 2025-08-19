/**
 *  Some objects are rather heavy to constructs so a sinple way to
 *  increase performance is to re-use those objects. This module
 *  exports a object pool factory that should be used for exactly
 *  that purpose.
 */
import memoize from './memoize.mjs';
import ObjectPool from './ObjectPool.mjs';

export default memoize((Type, ...args) => {
  return new ObjectPool(() => new Type(...args));
});