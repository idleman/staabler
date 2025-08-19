/**
 * Least Recently Used (LRU) Map implementation with configurable capacity.
 */
export default class LRUMap {
  
  /**
   * Creates a new LRUMap instance.
   * @param {number} maxLength - Maximum number of entries to store
   * @param {Function} Type - Constructor function for the underlying map (defaults to global Map)
   */
  constructor(maxLength = 0, Type = globalThis.Map) {
    this.size = 0;
    this.Type = Type;
    this.data = new Type();
    this.capacity = Math.max(0, maxLength);
  }

  /**
   * Returns an iterator of keys in the map.
   * @returns {Iterator} Iterator of keys
   */
  keys() {
    return this.data.keys?.();
  }

  /**
   * Returns an iterator of values in the map.
   * @returns {Iterator} Iterator of values
   */
  values() {
    return this.data.values?.();
  }

  /**
   * Returns an iterator of key-value pairs in the map.
   * @returns {Iterator} Iterator of [key, value] pairs
   */
  entries() {
    return this.data.entries?.();
  }

  /**
   * Sets a key-value pair in the map. If capacity is exceeded, removes least recently used entries.
   * @param {any} k - The key
   * @param {any} v - The value
   * @returns {LRUMap} This instance for chaining
   */
  set(k, v) {
    const data = this.data;
    data.set(k, v);
    while(this.capacity < data.size) {
      data.delete(data.keys().next().value);
    }
    this.size = data.size;
    return this;
  }

  /**
   * Gets a value by key and promotes it to most recently used.
   * @param {any} k - The key to look up
   * @returns {any} The value associated with the key, or undefined if not found
   */
  get(k) {
    const v = this.data.get(k);
    if(v !== void(0)) {
      // It rotate the value to the first
      this.data.delete?.(k);
      this.data.set(k, v);
    }
    return v;
  }

  /**
   * Checks if a key exists in the map.
   * @param {any} k - The key to check
   * @returns {boolean} True if the key exists, false otherwise
   */
  has(k) {
    return this.data.has?.(k);
  }

  /**
   * Clears all entries from the map.
   */
  clear() {
    this.data = new this.Type();
    this.size = 0;
  }

  /**
   * Returns an iterator for the map entries.
   * @returns {Iterator} Iterator of [key, value] pairs
   */
  [Symbol.iterator]() {
    return this.entries();
  }

};