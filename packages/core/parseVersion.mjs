import LRUMap from './LRUMap.mjs';
import withCache from './/withCache.mjs';
import parseInteger from './/parseInteger.mjs';

const impl = withCache(new LRUMap(2**4), base => {
  const reduceToNumber = (s, v, i, arr) => s + (v * base**(arr.length-i));
  return withCache(new LRUMap(2**12), version => {
    if(typeof version !== 'string') {
      return Number.isSafeInteger(version) ? version : 0;
    }
    
    const result = version
      .split('.')
      .map(v => parseInteger(v))
      .reduce(reduceToNumber, 0);

    return Number.isSafeInteger(result) ? result : 0;
  });
});

/**
 * Converts a version string into a comparable number for easy version comparison.
 * Uses caching for performance optimization.
 * 
 * @param {string|number} [version=''] - The version string or number to parse
 * @param {number} [base=1000] - The base for calculating version numbers (higher = more precision)
 * @returns {number} A number representing the version for comparison
 * 
 * @example
 * // Basic version comparison
 * const v1 = parseVersion('1.2.3');
 * const v2 = parseVersion('1.2.4');
 * const v3 = parseVersion('2.0.0');
 * 
 * console.log(v1 < v2); // true
 * console.log(v2 < v3); // true
 * 
 * // With custom base (more precision for minor versions)
 * const precise1 = parseVersion('1.2.3', 10000);
 * const precise2 = parseVersion('1.2.4', 10000);
 * 
 * // Non-string inputs
 * parseVersion(100);     // 100
 * parseVersion(null);    // 0
 * parseVersion('');      // 0
 */
export default function parseVersion(version = '', base = 1000) {
  return (impl(base))(version);
};