/**
 * Bidirectional Map implementation.
 * 
 * A BiMap maintains two-way mappings between keys and values, allowing
 * efficient lookup in both directions. Each key maps to exactly one value,
 * and each value maps to exactly one key.
 * 
 * @template K - The type of keys
 * @template V - The type of values
 * 
 * @example
 * const map = new BiMap();
 * map.set('a', 1);
 * map.set('b', 2);
 * 
 * map.get('a'); // 1
 * map.inverse.get(1); // 'a'
 * 
 * map.delete('a');
 * map.inverse.get(1); // undefined
 */
export default class BiMap {

  /**
   * Creates a new BiMap instance.
   * 
   * @param {Iterable<[K, V]>} [iterable] - Initial key-value pairs
   * @param {Function} [KeyMap=Map] - Constructor for the key-to-value map
   * @param {Function} [ValueMap=Map] - Constructor for the value-to-key map
   * @param {BiMap} [opposite] - The inverse BiMap (used internally)
   */
  constructor(iterable, KeyMap = Map, ValueMap = Map, opposite = null) {
    this.size = 0;
    this.data = new KeyMap();
    this.inverse = opposite ? opposite : new BiMap(null, ValueMap, KeyMap, this);

    if(iterable) {
      for(const [k,v] of iterable) {
        this.set(k, v);
      }
    }
  }

  /**
   * Sets a key-value pair in the BiMap.
   * 
   * If the key already exists, the operation is ignored to maintain
   * the one-to-one relationship.
   * 
   * @param {K} k - The key
   * @param {V} v - The value
   * @returns {BiMap} This BiMap instance for chaining
   * 
   * @example
   * map.set('a', 1);
   * map.set('b', 2);
   */
  set(k, v) {
    if(this.data.has(k)) {
      return this;
    }
    this.data.set(k, v);
    this.inverse.set(v, k);
    this.size += 1;
    return this;
  }

  /**
   * Gets the value associated with a key.
   * 
   * @param {K} k - The key to look up
   * @returns {V|undefined} The associated value or undefined if not found
   * 
   * @example
   * map.set('a', 1);
   * map.get('a'); // 1
   * map.get('b'); // undefined
   */
  get(k) {
    return this.data.get(k);
  }

  /**
   * Checks if a key exists in the BiMap.
   * 
   * @param {K} k - The key to check
   * @returns {boolean} True if the key exists, false otherwise
   * 
   * @example
   * map.set('a', 1);
   * map.has('a'); // true
   * map.has('b'); // false
   */
  has(k) {
    return this.data.has(k);
  }

  /**
   * Returns an iterator of all keys in the BiMap.
   * 
   * @returns {Iterator<K>} Iterator of keys
   * 
   * @example
   * for (const key of map.keys()) {
   *   console.log(key);
   * }
   */
  keys() {
    return this.data.keys();
  }

  /**
   * Returns an iterator of all values in the BiMap.
   * 
   * @returns {Iterator<V>} Iterator of values
   * 
   * @example
   * for (const value of map.values()) {
   *   console.log(value);
   * }
   */
  values() {
    return this.data.values();
  }

  /**
   * Returns an iterator of all key-value pairs in the BiMap.
   * 
   * @returns {Iterator<[K, V]>} Iterator of key-value pairs
   * 
   * @example
   * for (const [key, value] of map.entries()) {
   *   console.log(key, value);
   * }
   */
  entries() {
    return this.data.entries();
  }

  /**
   * Removes all key-value pairs from the BiMap.
   * 
   * @returns {BiMap} This BiMap instance for chaining
   * 
   * @example
   * map.clear();
   * map.size; // 0
   */
  clear() {
    if(this.size === 0) {
      return this;
    }
    this.size = 0;
    this.data.clear();
    this.inverse.clear();
    return this;
  }

  /**
   * Executes a function for each key-value pair in the BiMap.
   * 
   * @param {Function} cb - Function to execute for each pair
   * @param {V} cb.value - The value
   * @param {K} cb.key - The key
   * @param {BiMap} cb.map - The BiMap instance
   * 
   * @example
   * map.forEach((value, key, map) => {
   *   console.log(key, value);
   * });
   */
  forEach(cb) {
    return this.data.forEach((v, k) => cb(v, k, this));
  }

  /**
   * Removes a key-value pair from the BiMap.
   * 
   * @param {K} k - The key to remove
   * 
   * @example
   * map.set('a', 1);
   * map.delete('a');
   * map.get('a'); // undefined
   * map.inverse.get(1); // undefined
   */
  delete(k) {
    if(!this.data.has(k)) {
      return;
    }

    const v = this.data.get(k);
    this.data.delete(k);
    this.inverse.delete(v);
    this.size -= 1;
  }

  /**
   * Returns an iterator for the BiMap entries.
   * 
   * @returns {Iterator<[K, V]>} Iterator of key-value pairs
   * 
   * @example
   * for (const [key, value] of map) {
   *   console.log(key, value);
   * }
   */
  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }

};