import noop from './noop.mjs';
import memoize from './memoize.mjs';
import autobind from './autobind.mjs';
import tryCatch from './tryCatch.mjs';
import isNullish from './isNullish.mjs';
import isThenable from './isThenable.mjs';

/**
 * A memory-efficient object pool for reusing objects to reduce garbage collection pressure.
 * 
 * @example
 * // Create a pool for Uint8Array objects
 * const factory = () => new Uint8Array([0, 0]);
 * const deleter = obj => obj.forEach((_, i) => obj[i] = 0);
 * const pool = new ObjectPool(factory, deleter);
 * 
 * // Get an object from the pool
 * const obj = pool.construct();
 * obj[0] = 1;
 * obj[1] = 2;
 * 
 * // Return it to the pool
 * pool.destruct(obj);
 * 
 * // Use with automatic cleanup
 * const result = pool.use(obj => {
 *   obj[0] = 5;
 *   return obj[0] * 2;
 * });
 * // obj is automatically returned to pool after use
 */
export default class ObjectPool {

  /**
   * Creates a new ObjectPool instance.
   * 
   * @param {Function} factory - Function that creates new objects when pool is empty
   * @param {Function} [deleter=noop] - Function to clean up objects before returning to pool
   * @param {number} [maxLength=64] - Maximum number of objects to keep in the pool
   */
  constructor(factory, deleter = noop, maxLength = 64) {
    this.pool = [];
    this.factory = factory;
    this.maxLength = maxLength ?? 64;
    this._deleter = deleter ?? noop;
    autobind(this);
  }

  /**
   * Gets an object from the pool or creates a new one if pool is empty.
   * 
   * @returns {*} An object from the pool or newly created object
   */
  construct() {
    const pool = this.pool;
    return pool.length ? pool.pop() : this.factory();
  }

  /**
   * Returns an object to the pool after cleaning it up.
   * 
   * @param {*} obj - The object to return to the pool
   */
  destruct(obj) {
    this._deleter(obj);
    if(this.pool.length < this.maxLength) {
      this.pool.push(obj);
    }
  }

  /**
   * Uses an object from the pool with automatic cleanup.
   * Supports both synchronous and asynchronous callbacks.
   * 
   * @param {Function} cb - Callback function that receives the object and should return a result
   * @returns {*} The result of the callback function
   * @throws {Error} If the callback throws an error, the object is still returned to pool
   * 
   * @example
   * ```javascript
   * const pool = new ObjectPool(() => ({ data: [] }));
   * 
   * // Synchronous usage
   * const result = pool.use(obj => {
   *   obj.data.push(1, 2, 3);
   *   return obj.data.length;
   * });
   * 
   * // Asynchronous usage
   * const asyncResult = await pool.use(async obj => {
   *   obj.data = await fetchData();
   *   return obj.data;
   * });
   * ```
   */
  use(cb) {
    const item = this.construct();
    const onResult = (got) => {
      const [result, err] = got;
      this.destruct(item);
      if(!isNullish(err)) {
        throw err;
      }
      return result;
    };
    const result = tryCatch(() => cb(item));
    return isThenable(result) ? result.then(onResult) : onResult(result);
  }
};