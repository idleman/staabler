/**
 * Checks if all provided arguments are truthy strings.
 * @param {...any} args - Variable number of arguments to check
 * @returns {boolean} True if all arguments are truthy strings, false otherwise
 */
export default function isThuthyString(...args) {
  return !!(args.length && args.every(v => v && typeof v === 'string'));
};