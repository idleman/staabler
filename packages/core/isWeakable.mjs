/**
 * Checks if a value can be used as a key in WeakMap or WeakSet.
 * @param {any} obj - The value to check
 * @returns {boolean} True if the value can be used in Weak collections, false otherwise
 */
export default function isWeakable(obj) {
  const type = typeof obj;
  return !!(type === 'function' || (obj && type === 'object'));
};