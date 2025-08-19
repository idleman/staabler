/**
 * Checks if an object has no own enumerable properties.
 * @param {Object} obj - The object to check
 * @returns {boolean} True if the object has no own enumerable properties, false otherwise
 */
export default function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }
  return true;
};