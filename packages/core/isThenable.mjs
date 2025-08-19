/**
 * Checks if an object is thenable (has a 'then' method like a Promise).
 * @param {any} obj - The object to check
 * @returns {boolean} True if the object has a 'then' method, false otherwise
 */
export default function isThenable(obj) {
  return typeof obj?.then === 'function';
};