/**
 * Safely parses an integer value, returning a default value if parsing fails.
 * Only accepts valid integer strings (no scientific notation, no trailing characters).
 * 
 * @param {*} val - The value to parse as an integer
 * @param {*} [defaultValue] - The default value to return if parsing fails
 * @returns {number|*} The parsed integer or the default value
 * 
 * @example
 * parseInteger(10);           // 10
 * parseInteger('123');        // 123
 * parseInteger('123.45');     // undefined
 * parseInteger('123abc');     // undefined
 * parseInteger('123abc', 0);  // 0
 * parseInteger('7e2');        // undefined (scientific notation not allowed)
 * parseInteger();             // undefined
 */
export default function parseInteger(val, defaultValue) {
  const res = parseInt(val, 10);
  return (res == val && Number.isSafeInteger(res)) ? res : defaultValue;
};