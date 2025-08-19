import capitalize from './capitalize.mjs';
import toCamelCase from './toCamelCase.mjs';

/**
 * Converts a string to PascalCase format.
 * First converts to camelCase, then capitalizes the first letter.
 * 
 * @param {string} str - The string to convert to PascalCase
 * @returns {string} The PascalCase version of the input string
 * 
 * @example
 * toPascalCase('user'); // 'User'
 * toPascalCase('user-action-test'); // 'UserActionTest'
 * toPascalCase('user_action_test'); // 'UserActionTest'
 * toPascalCase('user_action_test12'); // 'UserActionTest12'
 */
export default function toPascalCase(str) {
  return capitalize(toCamelCase(str));
};