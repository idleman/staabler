import isNullish from './isNullish.mjs';

/**
 * Asserts that all Promise.allSettled results are fulfilled and extracts their values.
 * 
 * Takes an array of results from Promise.allSettled() and throws an error if any
 * of the promises were rejected. If all are fulfilled, returns an array of the values.
 * 
 * @param {Array<PromiseSettledResult>} array - Array of Promise.allSettled results
 * @param {Error|Function|any} [error] - Custom error to throw on rejection. Can be an Error instance, Error constructor, or any value
 * @returns {Array} Array of fulfilled values
 * @throws {Error} When any promise in the array was rejected
 * 
 * @example
 * // All promises fulfilled
 * const results = await Promise.allSettled([
 *   Promise.resolve(1),
 *   Promise.resolve(2)
 * ]);
 * const values = assertAllFulfilled(results); // [1, 2]
 * 
 * @example
 * // Some promises rejected - throws error
 * const results = await Promise.allSettled([
 *   Promise.resolve(1),
 *   Promise.reject(new Error('Failed'))
 * ]);
 * assertAllFulfilled(results); // Throws the rejection error
 * 
 * @example
 * // Custom error object
 * assertAllFulfilled(results, new Error('Custom error message'));
 * 
 * @example
 * // Custom error constructor
 * assertAllFulfilled(results, TypeError);
 */
export default function assertAllFulfilled(array, error) {
  return array.map(result => {
    if(result.status === 'fulfilled') {
      return result.value;
    }

    const obj = isNullish(error) ? result.reason :
                typeof error === 'function' ? new error() :
                error;
    throw obj;
  });
};