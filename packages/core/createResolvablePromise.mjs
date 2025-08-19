/**
 * Creates a promise with exposed resolve and reject functions.
 * 
 * Returns a promise object that has `resolve` and `reject` methods attached to it,
 * allowing external control over the promise's resolution or rejection.
 * 
 * @returns {Promise} A promise with resolve and reject methods attached
 * 
 * @example
 * // Basic usage
 * const promise = createResolvablePromise();
 * 
 * promise.then(value => console.log('Resolved:', value));
 * promise.catch(error => console.log('Rejected:', error));
 * 
 * // Later, resolve the promise
 * promise.resolve('success');
 * 
 * @example
 * // Reject the promise
 * const promise = createResolvablePromise();
 * 
 * promise.then(value => console.log('Resolved:', value));
 * promise.catch(error => console.log('Rejected:', error));
 * 
 * // Later, reject the promise
 * promise.reject(new Error('Something went wrong'));
 * 
 * @example
 * // Async/await usage
 * const promise = createResolvablePromise();
 * 
 * setTimeout(() => {
 *   promise.resolve('delayed result');
 * }, 1000);
 * 
 * const result = await promise; // 'delayed result'
 * 
 * @example
 * // Event-based resolution
 * const promise = createResolvablePromise();
 * 
 * button.addEventListener('click', () => {
 *   promise.resolve('button clicked');
 * });
 * 
 * const result = await promise; // Resolves when button is clicked
 */
export default function createResolvablePromise() {
  const { promise, resolve, reject } = Promise.withResolvers();
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};