const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Returns true if the property [name] exist as a property
 * in the object itself - otherwise false.
 *
 * @param {any} obj
 * @param {string} name
 * @returns {boolean}
 */
export default function hasOwnProperty(obj, name) {
  return hasOwn.call(obj, name);
};