/**
 * Gets a value from a nested collection using a path array.
 * 
 * Traverses a collection (object, array, Map, etc.) using a path array to access
 * deeply nested values. Supports different collection types with their respective
 * access methods (at, get, or bracket notation).
 * 
 * @param {any} collection - The collection to traverse (object, array, Map, etc.)
 * @param {Array} path - Array of keys/indices to traverse
 * @param {number} [index=0] - Starting index in the path array
 * @returns {any} The value at the specified path, or undefined if not found
 * 
 * @example
 * // Object traversal
 * const data = {
 *   user: {
 *     profile: {
 *       name: 'John',
 *       age: 30
 *     }
 *   }
 * };
 * 
 * getIn(data, ['user', 'profile', 'name']); // 'John'
 * getIn(data, ['user', 'profile', 'age']); // 30
 * getIn(data, ['user', 'profile', 'email']); // undefined
 * 
 * @example
 * // Array traversal
 * const data = [
 *   { name: 'Alice', scores: [85, 90, 78] },
 *   { name: 'Bob', scores: [92, 88, 95] }
 * ];
 * 
 * getIn(data, [0, 'scores', 1]); // 90
 * getIn(data, [1, 'name']); // 'Bob'
 * 
 * @example
 * // Map traversal
 * const data = new Map([
 *   ['user', new Map([
 *     ['profile', new Map([
 *       ['name', 'John'],
 *       ['age', 30]
 *     ])]
 *   ])]
 * ]);
 * 
 * getIn(data, ['user', 'profile', 'name']); // 'John'
 * 
 * @example
 * // Mixed collection types
 * const data = {
 *   users: [
 *     { name: 'Alice', settings: new Map([['theme', 'dark']]) },
 *     { name: 'Bob', settings: new Map([['theme', 'light']]) }
 *   ]
 * };
 * 
 * getIn(data, ['users', 0, 'settings', 'theme']); // 'dark'
 * 
 * @example
 * // Edge cases
 * getIn(null, ['a', 'b']); // undefined
 * getIn(undefined, ['a', 'b']); // undefined
 * getIn({}, ['a', 'b']); // undefined
 * getIn([], [0, 1]); // undefined
 */
export default function getIn(collection, path, index = 0) {
  return  path.length === index ? collection :
          (!collection || path.length < index) ? void(0) :
          typeof collection.at === 'function' ? getIn(collection.at(path[index]), path, index + 1) :
          typeof collection.get === 'function' ? getIn(collection.get(path[index]), path, index + 1) :
          getIn(collection[path[index]], path, index + 1);
};