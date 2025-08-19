/**
 * Capitalizes the first character of a string.
 * 
 * Converts the first character to uppercase while leaving the rest
 * of the string unchanged.
 * 
 * @param {string} str - The string to capitalize
 * @returns {string} The string with the first character capitalized
 * 
 * @example
 * capitalize('hello'); // 'Hello'
 * capitalize('world'); // 'World'
 * capitalize(''); // ''
 * capitalize('a'); // 'A'
 * 
 * @example
 * // Works with multi-word strings
 * capitalize('hello world'); // 'Hello world'
 */
export default function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};