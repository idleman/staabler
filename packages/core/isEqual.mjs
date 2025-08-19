/**
 * Performs deep equality comparison between two values.
 * Supports primitive types, arrays, objects, and objects with custom equals methods.
 * @param {any} a - First value to compare
 * @param {any} b - Second value to compare
 * @returns {boolean} True if values are deeply equal, false otherwise
 */
export default function isEqual(a, b) {
  // If both are same references or values (including NaN comparison)
  if (a === b || (Number.isNaN(a) && Number.isNaN(b))) {
    return true;
  }

  // If types are different, they're not equal
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle null (typeof null is 'object')
  if (a === null || b === null) {
    return a === b;
  }

  if(typeof a?.equals === 'function') {
    return a.equals(b);
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  // If none of the above conditions match, they're not equal
  return false;
};