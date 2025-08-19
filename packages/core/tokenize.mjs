import withCache from './withCache.mjs';
import LRUMap from './LRUMap.mjs';

const defaultTokens = [];

/**
 * Tokenizes a string by extracting Unicode letter sequences.
 * Uses caching for performance optimization with LRU eviction.
 * Supports multiple languages and Unicode characters.
 * 
 * @param {string} str - The string to tokenize
 * @returns {string[]} Array of letter tokens extracted from the string
 * 
 * @example
 * tokenize('Hello, world!'); // ['Hello', 'world']
 * tokenize('Привет, мир!'); // ['Привет', 'мир']
 * tokenize('こんにちは、世界！'); // ['こんにちは', '世界']
 * tokenize('Hello, world! Привет, мир! こんにちは、世界！');
 * // ['Hello', 'world', 'Привет', 'мир', 'こんにちは', '世界']
 */
export default withCache(new LRUMap(2**8), str => {
  // Use Unicode property escapes to match letters and numbers in any language
  // Combine them with the + quantifier to match one or more consecutive characters
  // The 'u' flag enables Unicode support in the regular expression
  return  typeof str !== 'string' ? defaultTokens :
          (str.match(/\p{L}+/gu) || defaultTokens);
});