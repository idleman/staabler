import noop from "./noop.mjs";

/**
 * A Map implementation that provides default values for missing keys.
 * 
 * Extends the standard Map behavior by automatically creating default values
 * when accessing keys that don't exist. The default value is created using
 * a factory function.
 * 
 * @template K - The type of keys
 * @template V - The type of values
 * 
 * @example
 * // Counter with default value 0
 * const counters = new DefaultMap(() => 0);
 * counters.get('user1'); // 0 (created automatically)
 * counters.set('user1', 5);
 * counters.get('user1'); // 5
 * 
 * @example
 * // Array factory
 * const groups = new DefaultMap(() => []);
 * groups.get('admin').push('user1');
 * groups.get('admin').push('user2');
 * console.log(groups.get('admin')); // ['user1', 'user2']
 * 
 * @example
 * // Object factory
 * const userProfiles = new DefaultMap(() => ({ visits: 0, lastSeen: null }));
 * const profile = userProfiles.get('john');
 * profile.visits++;
 * profile.lastSeen = new Date();
 */
export default class DefaultMap {
  
  /**
   * Creates a new DefaultMap instance.
   * 
   * @param {Function} [factory=noop] - Function that creates default values for missing keys
   * @param {Function} [Type=Map] - The Map constructor to use internally
   * 
   * @example
   * const map = new DefaultMap(() => 'default');
   * const customMap = new DefaultMap(() => [], WeakMap);
   */
  constructor(factory = noop, Type = globalThis.Map) {
    this.size = 0;
    this.Type = this.Type;
    this.data = new Type();
    this.factory = factory;
  }

  /**
   * Returns an iterator of all keys in the map.
   * 
   * @returns {Iterator<K>} Iterator of keys
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.set('b', 2);
   * 
   * for (const key of map.keys()) {
   *   console.log(key); // 'a', 'b'
   * }
   */
  keys() {
    return this.data.keys?.();
  }

  /**
   * Returns an iterator of all values in the map.
   * 
   * @returns {Iterator<V>} Iterator of values
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.set('b', 2);
   * 
   * for (const value of map.values()) {
   *   console.log(value); // 1, 2
   * }
   */
  values() {
    return this.data.values?.();
  }

  /**
   * Returns an iterator of all key-value pairs in the map.
   * 
   * @returns {Iterator<[K, V]>} Iterator of key-value pairs
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.set('b', 2);
   * 
   * for (const [key, value] of map.entries()) {
   *   console.log(key, value); // 'a' 1, 'b' 2
   * }
   */
  entries() {
    return this.data.entries?.();
  }

  /**
   * Sets a key-value pair in the map.
   * 
   * @param {K} k - The key
   * @param {V} v - The value
   * @returns {DefaultMap} This DefaultMap instance for chaining
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1).set('b', 2);
   */
  set(k, v) {
    const data = this.data;
    data.set(k, v);
    this.size = data.size;
    return this;
  }

  /**
   * Delete a entry in the map.
   * 
   * @param {K} k - The key
   * @returns {DefaultMap} This DefaultMap instance for chaining
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.delete('a').delete('b');
   */
  delete(k) {
    this.data.delete(k);
    this.size = this.data.size;
    return this;
  }

  /**
   * Checks if a key exists in the map.
   * 
   * @param {K} k - The key to check
   * @returns {boolean} True if the key exists, false otherwise
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.has('a'); // true
   * map.has('b'); // false
   */
  has(k) {
    return this.data.has(k);
  }

  /**
   * Gets the value associated with a key, creating a default value if the key doesn't exist.
   * 
   * If the key doesn't exist, the factory function is called to create a default value,
   * which is then stored in the map and returned.
   * 
   * @param {K} k - The key to look up
   * @returns {V} The associated value or the default value created by the factory
   * 
   * @example
   * const counters = new DefaultMap(() => 0);
   * counters.get('user1'); // 0 (created and stored)
   * counters.get('user1'); // 0 (retrieved from map)
   * 
   * @example
   * // Factory that returns undefined (no default created)
   * const map = new DefaultMap(() => undefined);
   * map.get('missing'); // undefined
   * map.has('missing'); // false (not stored)
   */
  get(k) {
    const v = this.data.get(k);
    if(v == void(0)) {
      const maybe = this.factory(k);
      if(maybe === void(0)) {
        return maybe;
      }
      this.data.set(k, maybe);
      return maybe;
    }
    return v;
  }

  /**
   * Removes all key-value pairs from the map.
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.clear();
   * map.size; // 0
   */
  clear() {
    this.data = new this.Type();
    this.size = 0;
  }

  /**
   * Returns an iterator for the map entries.
   * 
   * @returns {Iterator<[K, V]>} Iterator of key-value pairs
   * 
   * @example
   * const map = new DefaultMap(() => 0);
   * map.set('a', 1);
   * map.set('b', 2);
   * 
   * for (const [key, value] of map) {
   *   console.log(key, value); // 'a' 1, 'b' 2
   * }
   */
  [Symbol.iterator]() {
    return this.entries ();
  }

};