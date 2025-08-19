import isNullish from './isNullish.mjs';

const isNotNullish = v => !isNullish(v);

/**
 * Determines the error type and message for assertion failures.
 * 
 * @param {any} obj - The error object or message
 * @param {any} value - The value that failed the assertion
 * @returns {Array} Array containing [ErrorConstructor, message]
 * @private
 */
function getErrorDescriptor(obj, value) {
  const type = typeof obj;
  return  type === 'string' ? [Error, obj] :
          type === 'function' ? [obj, value] :
          [Error, `Assertion failed`];
}

/**
 * Asserts that a value meets a given condition.
 * 
 * Throws an error if the value fails the assertion. By default, checks
 * that the value is not null or undefined.
 * 
 * @param {any} val - The value to assert
 * @param {Function} [cb=isNotNullish] - The assertion function that should return true for valid values
 * @param {string|Function} [err='Assertion failed'] - The error message or error constructor
 * @returns {any} The original value if assertion passes
 * @throws {Error} When the assertion fails
 * 
 * @example
 * // Basic assertion (not nullish)
 * assert(123); // Passes
 * assert(null); // Throws Error
 * 
 * @example
 * // Custom assertion function
 * assert(5, x => x > 0); // Passes
 * assert(-1, x => x > 0); // Throws Error
 * 
 * @example
 * // Custom error message
 * assert(null, isNotNullish, 'Value cannot be null');
 * 
 * @example
 * // Custom error constructor
 * assert(null, isNotNullish, TypeError);
 */
export default function assert(val, cb = isNotNullish, err = 'Assertion failed') {
  if(!cb(val)) {
    const [Type, msg] = getErrorDescriptor(err, val);
    throw new Type(msg);
  }
  return val;
};