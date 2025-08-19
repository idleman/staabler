import capitalize from './capitalize.mjs';

/**
 * Maps array elements to camelCase format, capitalizing all but the first element.
 * @param {string} v - The string value to process
 * @param {number} i - The index of the element
 * @returns {string} The processed string
 */
const mapper = (v, i) => i === 0 ? v : capitalize(v);

/**
 * Converts a string to camelCase format.
 * Extracts alphanumeric sequences and converts them to camelCase.
 * 
 * @param {string} str - The string to convert to camelCase
 * @returns {string} The camelCase version of the input string
 * 
 * @example
 * toCamelCase('user'); // 'user'
 * toCamelCase('user-action-test'); // 'userActionTest'
 * toCamelCase('user_action_test'); // 'userActionTest'
 * toCamelCase('user-action-test12'); // 'userActionTest12'
 */
export default function toCamelCase(str) {
  const result = str.match(/[a-z1-9]+/gi);
  const tmp = result ? result.map(mapper).join('') : str;
  if(!tmp) {
    return tmp;
  }

  const rest = tmp.substring(1);
  const first = tmp.substring(0, 1);
  return first.toLowerCase() + rest;
};