import isThenable from './isThenable.mjs';

/**
 * Creates a resolved result array for successful operations.
 * @param {any} value - The resolved value
 * @returns {[any]} Array containing the resolved value
 */
const onResolve = value => [value];

/**
 * Executes a callback function and returns the result or error.
 * @param {Function} cb - The callback function to execute
 * @returns {Object} Object with status ('resolved' or 'rejected') and value
 */
function execute(cb) {
  try {
    const value = cb();
    return { status: 'resolved', value };
  } catch(value) {
    return { status: 'rejected', value };
  }
}

/**
 * Executes a callback function in a try-catch block,
 * and resolves or rejects accordingly.
 * Handles both synchronous and asynchronous operations.
 *
 * @param {Function} cb - The callback function to execute
 * @param {any} defaultValue - The default value to return in case of rejection
 * @returns {[any, Error] | Promise<[any, Error]>} Either an array containing the resolved value, or an array containing the default value and error
 * 
 * @example
 * // Synchronous success
 * const [result] = tryCatch(() => 'success');
 * // result = 'success'
 * 
 * @example
 * // Synchronous error
 * const [result, error] = tryCatch(() => { throw new Error('fail'); }, 'default');
 * // result = 'default', error = Error('fail')
 * 
 * @example
 * // Asynchronous success
 * const [result] = await tryCatch(() => Promise.resolve('success'));
 * // result = 'success'
 * 
 * @example
 * // Asynchronous error
 * const [result, error] = await tryCatch(() => Promise.reject('fail'), 'default');
 * // result = 'default', error = 'fail'
 */
export default function tryCatch(cb, defaultValue) {
  const { status, value } = execute(cb);
  const onReject = error => [defaultValue, error];
  return (status === 'rejected') ? onReject(value) :
    !isThenable(value) ? onResolve(value) :
    value.then(onResolve, onReject);
};