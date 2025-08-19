import forward from './forward.mjs';
import isThenable from './isThenable.mjs';

/**
 * Invokes a callback with a value, handling both synchronous and asynchronous values.
 * If the value is a promise, it returns the promise chained with the callback.
 * Otherwise, it directly invokes the callback with the value.
 *
 * @param {any} maybe - The value to process (can be a promise or any value)
 * @param {Function} onValue - The callback function to invoke (default: forward)
 * @returns {any|Promise<any>} The result of the callback or a promise that resolves to it
 * 
 * @example
 * // Synchronous value
 * const result = withValue(123, val => val * 2);
 * // result = 246
 * 
 * @example
 * // Asynchronous value
 * const promise = withValue(Promise.resolve(123), val => val * 2);
 * const result = await promise;
 * // result = 246
 * 
 * @example
 * // Using default forward function
 * const result = withValue(123);
 * // result = 123
 */
export default function withValue(maybe, onValue = forward) {
  return isThenable(maybe) ? maybe.then(onValue) : onValue(maybe);
};