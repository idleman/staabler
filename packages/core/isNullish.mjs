/**
 * Checks if a value is null or undefined.
 * @param {any} val - The value to check
 * @returns {boolean} True if the value is null or undefined, false otherwise
 */
export default function isNullish(val) {
  return (val === null || val === void(0));
};