import getIn from './getIn.mjs';

/**
 * Compares two values using string comparison.
 * @param {any} a - First value to compare
 * @param {any} b - Second value to compare
 * @returns {number} - Negative if a < b, 0 if a === b, positive if a > b
 */
function compare(a, b) {
  return (a === b) ? 0 : `${a}`.localeCompare(`${b}`);
}

/**
 * Creates a comparison function for sorting objects by multiple keys.
 * Supports both direct property access and nested property access using arrays.
 * 
 * @param {...(string|string[]|boolean)} args - Keys to sort by and optional descending flag
 * @returns {function} A comparison function that can be used with Array.sort()
 * 
 * @example
 * // Sort by single property
 * const sortByName = sortBy('name');
 * users.sort(sortByName);
 * 
 * @example
 * // Sort by multiple properties
 * const sortByAgeThenName = sortBy('age', 'name');
 * users.sort(sortByAgeThenName);
 * 
 * @example
 * // Sort by nested property
 * const sortByAddressCity = sortBy(['address', 'city']);
 * users.sort(sortByAddressCity);
 * 
 * @example
 * // Sort in descending order
 * const sortByAgeDesc = sortBy('age', true);
 * users.sort(sortByAgeDesc);
 */
export default function sortBy(...args) {
  const descending = (typeof args.at(-1)) === 'boolean' ? args.pop() : false;
  const multiplier = descending ? -1 : 1;
  return (first, second) => {

    for(const key of args) {
      const a = Array.isArray(key) ? getIn(first, key) : first[key];
      const b = Array.isArray(key) ? getIn(second, key) : second[key];
      const result = compare(a, b) * multiplier;

      if(result) {
        return result;
      }
    }
    return 0;
  };
};