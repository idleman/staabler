import getIn from './getIn.mjs';

/**
 * Sets a value at a nested path in a collection (object or Map).
 * Supports both plain objects and Map-like objects with a `set` method.
 * 
 * @param {Object|Map} collection - The collection to set the value in
 * @param {Array<string>} path - The path to set the value at
 * @param {*} value - The value to set
 * 
 * @example
 * // With plain objects
 * const obj = {
 *   user: {
 *     profile: {
 *       name: 'John'
 *     }
 *   }
 * };
 * 
 * setIn(obj, ['user', 'profile', 'age'], 30);
 * console.log(obj.user.profile.age); // 30
 * 
 * // With Maps
 * const map = new Map([
 *   ['user', new Map([
 *     ['profile', new Map([
 *       ['name', 'John']
 *     ])]
 *   ])]
 * ]);
 * 
 * setIn(map, ['user', 'profile', 'age'], 30);
 * console.log(map.get('user').get('profile').get('age')); // 30
 */
export default function setIn(collection, path, value) {
  const name = path.at(-1);
  const parent = path.length === 1 ? collection : getIn(collection, path.slice(0, path.length -1));

  if(typeof parent?.set === 'function') {
    parent.set(name, value);
    return;
  }
  parent[name] = value;
};