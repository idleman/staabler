import isObjectLiteral from './isObjectLiteral.mjs';

/**
 * Compares two boolean values.
 * 
 * @param {boolean} a - First boolean value
 * @param {boolean} b - Second boolean value
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @private
 */
const compareBool = (a, b) => a === b ? 0 : (a === false ? -1 : 1);

/**
 * Compares two strings using locale-aware comparison.
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @private
 */
const compareString = (a, b) => a.localeCompare(b);

/**
 * Compares two numbers.
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @private
 */
const compareNumber = (a, b) => a === b ? 0 : (a < b) ? -1 : 1;

/**
 * Compares two arrays element by element.
 * 
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @private
 */
function compareArray(a, b) {
  const length = a.length;
  const diff = length - b.length;
  if(diff !== 0) {
    return diff;
  }
  for(let i = 0; i < length; ++i) {
    const result = compare(a[i], b[i]);
    if(result !== 0) {
      return result;
    }
  }
  return 0;
}

/**
 * Compares two object literals by their properties.
 * 
 * @param {Object} a - First object
 * @param {Object} b - Second object
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @private
 */
function compareObjectLiteral(a, b) {
  for(const [k, v] of Object.entries(a)) {
    const result = compare(v, b[k]);
    if(result !== 0) {
      return result;
    }
  }
  return 0;
}

/**
 * Compares two values of any type.
 * 
 * Provides a consistent comparison function that works with primitive types,
 * arrays, objects, and objects with custom comparison methods. Returns a
 * value suitable for sorting: negative if a < b, 0 if equal, positive if a > b.
 * 
 * @param {any} a - First value to compare
 * @param {any} b - Second value to compare
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 * @throws {Error} When types don't match or unsupported types are encountered
 * 
 * @example
 * // Primitive types
 * compare(1, 2); // -1
 * compare(2, 1); // 1
 * compare(1, 1); // 0
 * 
 * @example
 * // Strings
 * compare('a', 'b'); // -1
 * compare('b', 'a'); // 1
 * compare('a', 'a'); // 0
 * 
 * @example
 * // Booleans (false < true)
 * compare(false, true); // -1
 * compare(true, false); // 1
 * compare(true, true); // 0
 * 
 * @example
 * // Arrays
 * compare([1, 2], [1, 3]); // -1
 * compare([1, 2], [1, 2]); // 0
 * compare([1, 3], [1, 2]); // 1
 * 
 * @example
 * // Objects
 * compare({ a: 1 }, { a: 2 }); // -1
 * compare({ a: 1 }, { a: 1 }); // 0
 * compare({ a: 2 }, { a: 1 }); // 1
 * 
 * @example
 * // Objects with custom compare method
 * const obj1 = { value: 1, compare(other) { return this.value - other.value; } };
 * const obj2 = { value: 2, compare(other) { return this.value - other.value; } };
 * compare(obj1, obj2); // -1
 * 
 * @example
 * // Objects with toJSON method
 * const obj1 = { data: { value: 1 }, toJSON() { return this.data; } };
 * const obj2 = { data: { value: 2 }, toJSON() { return this.data; } };
 * compare(obj1, obj2); // -1
 */
export default function compare(a, b) {
  const type = typeof a;
  if(type !== typeof b) {
    throw new Error(`Type mismatch (expected=${type}, got=${typeof b}`);
  }

  
  switch(type) {
    case 'boolean':
      return compareBool(a, b);
    case 'string':
      return compareString(a, b);
    case 'number':
    case 'bigint':
      return compareNumber(a, b);
    case 'object':    
      if(typeof a.compare === 'function') {
        return a.compare(b);
      }
      
      if(typeof a.toJSON === 'function' && typeof b.toJSON === 'function') {
        return compare(a.toJSON(), b.toJSON());
      }
      if(Array.isArray(a) || a.constructor?.BYTES_PER_ELEMENT) { 
        return compareArray(a, b);
      }  
      if(isObjectLiteral(a)) {
        return compareObjectLiteral(a, b);
      }
      
  }
  throw new Error(`Unsupported type: ${type}`);
};