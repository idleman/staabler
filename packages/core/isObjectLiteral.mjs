/**
 * Checks if an object is a plain object literal (not an instance of a class).
 * @param {any} obj - The object to check
 * @returns {boolean} True if the object is a plain object literal, false otherwise
 */
export default function isObjectLiteral(obj) {
  if(!obj) {
    return false;
  }
  const prototype = Object.getPrototypeOf(obj);
  return (prototype === Object.prototype || (typeof obj === 'object' && prototype === null));
};