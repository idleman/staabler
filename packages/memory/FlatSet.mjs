import FlatList from './FlatList.mjs';
import withCache from '@staabler/core/withCache.mjs';

/**
 * Default comparison function for sorting FlatSet items.
 * Uses Buffer.compare for binary comparison of item buffers.
 * 
 * @param {Object} a - First item to compare
 * @param {Object} b - Second item to compare
 * @returns {number} Comparison result (-1, 0, or 1)
 */
const defaultCompare = (a, b) => Buffer.compare(a.buffer, b.buffer);

/**
 * A memory-efficient set implementation that maintains sorted order.
 * Provides set-like functionality with minimal memory overhead and binary search operations.
 */
class FlatSet  {
  
  /**
   * Creates a new FlatSet instance.
   * 
   * @param {Function} List - FlatList constructor function
   * @param {...*} args - Arguments to pass to the FlatList constructor
   */
  constructor(List, ...args) {
    this.items = new List(...args);
  }

  /**
   * Gets the number of items in the set.
   * 
   * @returns {number} Number of items
   */
  get size() {
    return this.items.length;
  }

  /**
   * Ensures the buffer has enough capacity for the specified number of items.
   * 
   * @param {number} [len=0] - Minimum number of items to reserve space for
   * @param {boolean} [force=false] - Force reallocation even if current capacity is sufficient
   * @returns {FlatSet} This instance for chaining
   */
  reserve(len = 0, force = false) {
    this.items.reserve(len, force);
    return this;
  }

  /**
   * Reduces buffer size to fit the current number of items.
   * 
   * @returns {FlatSet} This instance for chaining
   */
  shrinkToFit() {
    this.items.shrinkToFit();
    return this;
  }
  
  /**
   * Gets a handle to an item at the specified position.
   * 
   * @param {number} [pos=0] - Position of the item (negative values count from end)
   * @returns {Object|undefined} Item handle or undefined if position is out of bounds
   */
  handle(pos = 0) {
    return this.items.handle(pos);
  }

  /**
   * Converts the set to a JavaScript array.
   * 
   * @returns {Array} Array containing all items converted to JavaScript objects
   */
  toJS() {
    return this.items.toJS();
  }
  
  /**
   * Gets an item at the specified position.
   * 
   * @param {number} [pos=0] - Position of the item (negative values count from end)
   * @returns {Object|undefined} Item at the position or undefined if out of bounds
   */
  at(pos = 0) {
    return this.items.at(pos);
  }

  /**
   * Adds an item to the set using binary search insertion.
   * Maintains sorted order and prevents duplicates.
   * 
   * @param {Object} obj - Item to add
   * @param {Function} [cmp=defaultCompare] - Comparison function
   * @returns {FlatSet} This instance for chaining
   */
  add(obj, cmp = defaultCompare) {
    const items = this.items;
    const Type = items.Type;
    const item = (obj instanceof Type) ? obj : new Type(obj);
    
    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const other = items.handle(mid);
      const result = cmp(item, other);
      if (result < 0) {
        high = mid - 1;
      } else if(0 < result) {
        low = mid + 1;
      } else {
        // Duplicate
        return this;
      }
    }
    // console.log(`Inserting item(${low}):`, item.toJS());
    // console.log('Before: ', this.toJS());
    items.insert(low, item);
    //console.log('After: ', this.toJS());
    return this;
  }

  /**
   * Finds the index of an item that satisfies the test function using binary search.
   * 
   * @param {Function} cb - Test function that returns comparison result (-1, 0, or 1)
   * @returns {number} Index of matching item or -1 if not found
   */
  findIndex(cb) {
    const items = this.items;
    
    let low = 0;
    let high = items.length - 1;

    // Binary search
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const result = cb(this.handle(mid));
      if (result < 0) {
        high = mid - 1;
      } else if (0 < result) {
        low = mid + 1;
      } else {
        return mid;
      }
    }
    return -1;
  }

  /**
   * Finds an item that satisfies the test function.
   * 
   * @param {Function} cb - Test function that returns comparison result (-1, 0, or 1)
   * @returns {Object|undefined} Matching item or undefined if not found
   */
  find(cb) {
    const index = this.findIndex(cb);
    return index === -1 ? void(0) : this.handle(index);
  }

  /**
   * Find the lower bound of the first element that matches the predicate.
   * 
   * @param {Function} predicate - Predicate function to test items
   * @param {number} [hint=null] - Optional hint for the starting index
   * @returns {number} Lower bound index or -1 if not found
   */
  lower(predicate, hint = null) {
    const max = this.items.length - 1;
    let index = hint ?? this.findIndex(predicate);
    if(!(0 <= index && index <= max)) {
      return -1;
    }
    while(0 < index) {
      const obj = this.handle(index - 1);
      if(!predicate(obj)) {
        break;
      }
      --index;
    }
    return index;
  }

  /**
   * Find the upper bound of the last element that matches the predicate.
   * 
   * @param {Function} predicate - Predicate function to test items
   * @param {number} [hint=null] - Optional hint for the starting index
   * @returns {number} Upper bound index or -1 if not found
   */
  upper(predicate, hint) {
    const max = this.items.length - 1;
    let index = hint ?? this.findIndex(predicate);
    if(!(0 <= index && index <= max)) {
      return -1;
    }
    
    while(index < max) {
      const obj = this.handle(index + 1);
      if(!predicate(obj)) {
        break;
      }
      ++index;
    }
    return index;
  }

  /**
   * Finds the range of items that match the predicate.
   * 
   * @param {Function} cb - Test function that returns comparison result (-1, 0, or 1)
   * @returns {Array|undefined} [lower, upper] bounds or undefined if not found
   */
  range(cb) {
    const hint = this.findIndex(cb);
    if (hint === -1) {
      return;
    }
    const lower = this.lower(cb, hint);
    const upper = lower === -1 ? -1 : this.upper(cb, hint);
    return [lower, upper];
  }

  /**
   * Removes an item at the specified position.
   * 
   * @param {number} [pos=0] - Position of the item to remove
   * @returns {FlatSet} This instance for chaining
   */
  delete(pos = 0) {
    this.items.delete(pos);
    return this;
  }

  /**
   * Returns an iterator for [index, item] pairs.
   * 
   * @returns {Iterator} Iterator yielding [index, item] pairs
   */
  entries() {
    return this.items.entries();
  }

  /**
   * Returns an iterator for indices.
   * 
   * @returns {Iterator} Iterator yielding indices
   */
  keys() {
    return this.items.keys();
  }

  /**
   * Returns an iterator for items.
   * 
   * @returns {Iterator} Iterator yielding items
   */
  values() {
    return this.items.values();
  }

  /**
   * Returns an iterator for items (default iterator).
   * 
   * @returns {Iterator} Iterator yielding items
   */
  [Symbol.iterator]() {
    return this.values();
  }

  /**
   * Creates a new array with the results of calling a function for every item.
   * 
   * @param {Function} cb - Function to call for each item
   * @returns {Array} New array with transformed items
   */
  map(cb) {
    return this.toJS().map((val, index) => cb(val, index, this));
  }

  /**
   * Creates a new array with items that pass the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {Array} New array with filtered items
   */
  filter(cb) {
    return this.toJS().filter((val, index) => cb(val, index, this));
  }

  /**
   * Executes a function for each item in the set.
   * 
   * @param {Function} cb - Function to execute for each item
   * @returns {FlatSet} This instance for chaining
   */
  forEach(cb) {
    this.items.forEach((val, index) => cb(val, index, this));
    return this;
  }

  /**
   * Reduces the set to a single value by executing a function for each item.
   * 
   * @param {Function} cb - Reducer function
   * @param {*} state - Initial state
   * @returns {*} Final state
   */
  reduce(cb, state) {
    return this.items.reduce((state, val, index) => cb(state, val, index, this), state);
  }

  /**
   * Tests whether at least one item passes the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {boolean} True if at least one item passes the test
   */
  some(cb) {
    return this.items.some((val, index) => cb(val, index, this));
  }

  /**
   * Tests whether all items pass the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {boolean} True if all items pass the test
   */
  every(cb) {
    return this.items.every((val, index) => cb(val, index, this));
  }

};

/**
 * Creates a FlatSet class for a specific Record type.
 * 
 * @param {Function} Record - Record constructor function
 * @returns {Function} FlatSet class specialized for the Record type
 */
export default withCache(new WeakMap(), Record => {

  const List = FlatList(Record);
  return class Set extends FlatSet {

    static BYTES_PER_ELEMENT = Record.BYTES_PER_ELEMENT;

    /**
     * Creates a new Set instance for the specified Record type.
     * 
     * @param {...*} args - Arguments to pass to FlatSet constructor
     */
    constructor(...args) {
      super(List, ...args);
    }

  };
});
