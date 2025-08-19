/**
 * A sparse array-based map implementation optimized for integer keys.
 * Uses bitwise OR to convert keys to integers and stores values in an array.
 * 
 * @example
 * const map = new SparseMap();
 * map.set(5, 'value');
 * map.get(5); // 'value'
 */
export default class SparseMap {

  /**
   * Creates a new SparseMap instance.
   */
  constructor() {
    this.values = [];
  }

  /**
   * Sets a value for the given key.
   * @param {number} key - The key to set (will be converted to integer)
   * @param {any} value - The value to store
   */
  set(key, value) {
    const index = key | 0;
    this.values[index] = value;
  }

  /**
   * Gets the value for the given key.
   * @param {number} key - The key to retrieve (will be converted to integer)
   * @returns {any} The stored value or undefined if not found
   */
  get(key) {
    const index = key | 0;
    return this.values[index];
  }

};