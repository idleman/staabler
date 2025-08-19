import isNullish from './isNullish.mjs';
import withCache from './withCache.mjs';

/**
 * Promisifies a callback-based function. Returns a function that forwards all arguments
 * to the provided function with an additional completion handler and returns a promise.
 * Uses caching for performance optimization.
 * 
 * @param {Function} cb - The callback-based function to promisify
 * @returns {Function} A promisified version of the function
 * 
 * @example
 * // Convert a callback-based function to promise-based
 * const fs = require('fs');
 * const readFile = promisify(fs.readFile);
 * 
 * // Usage
 * const content = await readFile('file.txt', 'utf8');
 * 
 * // Custom callback function
 * const getUser = promisify((id, callback) => {
 *   // Simulate async operation
 *   setTimeout(() => {
 *     if (id === 1) {
 *       callback(null, { id: 1, name: 'John' });
 *     } else {
 *       callback(new Error('User not found'));
 *     }
 *   }, 100);
 * });
 * 
 * try {
 *   const user = await getUser(1);
 *   console.log(user); // { id: 1, name: 'John' }
 * } catch (error) {
 *   console.error(error.message); // 'User not found'
 * }
 */
export default withCache(new WeakMap(), cb => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      return cb(...args, (err, result) => isNullish(err) ? resolve(result) : reject(err));
    });
  };
});