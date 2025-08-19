import autobind from './autobind.mjs';
import isWeakable from './isWeakable.mjs';

/**
 * A Map collection that automatically uses WeakMap for weakable keys and Map for others.
 * Provides a unified interface for both strong and weak references.
 * 
 * @example
 * const map = new PersistentMap();
 * 
 * // Strong references (uses Map internally)
 * const key1 = 'string-key';
 * map.set(key1, 'value1');
 * 
 * // Weak references (uses WeakMap internally)
 * const key2 = { id: 1 };
 * map.set(key2, 'value2');
 * 
 * // From iterable
 * const entries = [['key1', 'value1'], [{ id: 1 }, 'value2']];
 * const map2 = new PersistentMap(entries);
 */
export default class PersistentMap {

  /**
   * Creates a new PersistentMap instance.
   * 
   * @param {Iterator} [iterable] - Optional iterable of [key, value] pairs
   * @param {Map} [map=new Map()] - Optional Map instance to use for strong references
   */
  constructor(iterable, map = new Map()) {
    autobind(this);
    this._map = map;
    this._weakMap = new WeakMap();
    if(iterable) {
      for(const [k,v] of iterable) {
        this.set(k,v);
      }
    }
  }

  /**
   * Checks if a key exists in the map.
   * 
   * @param {*} k - The key to check
   * @returns {boolean} True if the key exists
   */
  has(k) {
    const map = isWeakable(k) ? this._weakMap : this._map;
    return map.has(k);
  }

  /**
   * Gets the value associated with a key.
   * 
   * @param {*} k - The key to get
   * @returns {*} The value associated with the key or undefined
   */
  get(k) {
    const map = isWeakable(k) ? this._weakMap : this._map;
    return map.get(k);
  }

  /**
   * Sets a key-value pair in the map.
   * 
   * @param {*} k - The key to set
   * @param {*} v - The value to associate with the key
   * @returns {PersistentMap} This instance for chaining
   */
  set(k, v) {
    const map = isWeakable(k) ? this._weakMap : this._map;
    map.set(k,v);
    return this;
  }

  /**
   * Deletes a key-value pair from the map.
   * 
   * @param {*} k - The key to delete
   * @returns {PersistentMap} This instance for chaining
   */
  delete(k) {
    const map = isWeakable(k) ? this._weakMap : this._map;
    map.delete(k);
    return this;
  }

  /**
   * Clears all key-value pairs from the map.
   * 
   * @returns {PersistentMap} This instance for chaining
   */
  clear() {
    this._map = new Map();
    this._weakMap = new WeakMap();
    return this;
  }

  /**
   * Returns an iterator of all keys (only from the strong Map).
   * 
   * @returns {Iterator} Iterator of keys
   */
  keys() {
    return this._map.keys();
  }

  /**
   * Returns an iterator of all values (only from the strong Map).
   * 
   * @returns {Iterator} Iterator of values
   */
  values() {
    return this._map.values();
  }

  /**
   * Returns an iterator of all [key, value] pairs (only from the strong Map).
   * 
   * @returns {Iterator} Iterator of [key, value] pairs
   */
  entries() {
    return this._map.entries();
  }

  /**
   * Returns an iterator for the map entries (only from the strong Map).
   * 
   * @returns {Iterator} Iterator of [key, value] pairs
   */
  [Symbol.iterator]() {
    return this.entries();
  }
};