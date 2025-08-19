import forward from './forward.mjs';
import isObjectLiteral from './isObjectLiteral.mjs';

/**
 * Encodes a value for URL query parameters, handling nested objects.
 * 
 * @param {string} key - The parameter key
 * @param {any} val - The value to encode
 * @param {Function} transform - Function to transform values before encoding
 * @returns {string} The encoded query parameter string
 * @private
 */
function encodeValue(key, val, transform) {
  if(!isObjectLiteral(val)) {
    return `${key}=${encodeURIComponent(transform(val, key))}`;
  }
  return Object
    .entries(val)
    .map(([k, v]) => encodeValue(`${key}[${k}]`, v, transform))
    .join('&');
}

/**
 * Creates a URL query string from an object.
 * 
 * Converts an object into a form-urlencoded query string, supporting nested
 * objects with bracket notation. Arrays are treated as objects with 'fields' key.
 * 
 * @param {Object|Array} query - The query object or array to encode
 * @param {Function} [transform=forward] - Function to transform values before encoding
 * @returns {string} The encoded query string (without leading '?')
 * 
 * @example
 * // Simple object
 * createSearchQuery({ a: 1, b: 2 }); // "a=1&b=2"
 * 
 * @example
 * // Nested objects
 * createSearchQuery({ 
 *   name: { eq: 123 } 
 * }); // "name[eq]=123"
 * 
 * @example
 * // Multiple nested properties
 * createSearchQuery({ 
 *   name: { eq: 123, lgt: 321 } 
 * }); // "name[eq]=123&name[lgt]=321"
 * 
 * @example
 * // Deeply nested objects
 * createSearchQuery({ 
 *   name: { eq: { foo: 123 } } 
 * }); // "name[eq][foo]=123"
 * 
 * @example
 * // Arrays (converted to fields)
 * createSearchQuery(['a', 'b', 'c']); // "fields=a&fields=b&fields=c"
 * 
 * @example
 * // With custom transform function
 * createSearchQuery(
 *   { status: 'active' },
 *   (value, key) => key === 'status' ? value.toUpperCase() : value
 * ); // "status=ACTIVE"
 * 
 * @example
 * // Empty or null query
 * createSearchQuery(null); // ""
 * createSearchQuery({}); // ""
 */
export default function createSearchQuery(query, transform = forward) {
  if(!query) {
    return '';
  }

  if(Array.isArray(query)) {
    return createSearchQuery({ fields: query }, transform);
  }

  const result = Object
    .entries(query)
    .map(([k, v]) => encodeValue(k, v, transform))
    .join('&');

  return result ? `?${result}` : '';
};