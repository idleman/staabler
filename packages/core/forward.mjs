/**
 * Identity function that returns its input unchanged.
 * 
 * A utility function that simply returns whatever value is passed to it.
 * Useful as a default transform function or when you need a no-op function.
 * 
 * @param {any} obj - The value to return
 * @returns {any} The input value unchanged
 * 
 * @example
 * // Basic usage
 * forward('hello'); // 'hello'
 * forward(123); // 123
 * forward({ a: 1 }); // { a: 1 }
 * 
 * @example
 * // As a default transform function
 * const transform = (value, key) => key === 'status' ? value.toUpperCase() : forward(value);
 * 
 * transform('active', 'status'); // 'ACTIVE'
 * transform('name', 'title'); // 'name'
 * 
 * @example
 * // In functional programming
 * const pipeline = [forward, x => x * 2, forward, x => x + 1];
 * const result = pipeline.reduce((acc, fn) => fn(acc), 5); // 11
 */
export default function forward(obj) {
  return obj;
};