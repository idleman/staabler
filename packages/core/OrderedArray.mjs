import noop from './noop.mjs';
import defaultCompare from './compare.mjs';

/**
 * A sorted array that maintains elements in order based on a comparison function.
 * Provides efficient insertion and binary search operations.
 * 
 * @example
 * // Create an ordered array of numbers
 * const numbers = new OrderedArray();
 * numbers.push(50, 30, 10, 40);
 * console.log(Array.from(numbers)); // [10, 30, 40, 50]
 * 
 * // Create an ordered array of objects
 * const users = new OrderedArray((a, b) => a.id - b.id);
 * users.push({ id: 3, name: 'Alice' }, { id: 1, name: 'Bob' });
 * console.log(Array.from(users)); // [{ id: 1, name: 'Bob' }, { id: 3, name: 'Alice' }]
 */
export default class OrderedArray {

  /**
   * Creates an OrderedArray from an iterable.
   * 
   * @param {Iterable} iterable - The iterable to create from
   * @returns {OrderedArray} A new OrderedArray instance
   */
  static from(iterable) {
    if(iterable instanceof OrderedArray) {
      return iterable;
    }
    const map = new OrderedArray();
    map.push(...iterable);
    return map;
  }
  
  /**
   * Creates a new OrderedArray.
   * 
   * @param {Function} [compare=defaultCompare] - Comparison function for sorting
   */
  constructor(compare = defaultCompare) {
    this.size = 0;
    this.array = [];
    this.compare = compare;
  }

  /**
   * Gets the element at the specified index.
   * 
   * @param {number} [index=0] - The index to get
   * @returns {*} The element at the specified index
   */
  at(index = 0) {
    return this.array.at(index);
  }

  /**
   * Gets the first element in the array.
   * 
   * @returns {*} The first element
   */
  first() {
    return this.array[0];
  }

  /**
   * Gets the last element in the array.
   * 
   * @returns {*} The last element
   */
  last() {
    return this.array[this.array.length - 1];
  }

  /**
   * Clears all elements from the array.
   * 
   * @returns {OrderedArray} This instance for chaining
   */
  clear() {
    this.array = [];
    this.size = 0;
    return this;
  }

  /**
   * Pushes new items into the array while maintaining order.
   * Uses binary insertion for small arrays, full sort for larger batches.
   * 
   * @param {...*} items - Items to add to the array
   * @returns {OrderedArray} This instance for chaining
   * 
   * @example
   * ```javascript
   * const arr = new OrderedArray();
   * arr.push(3, 1, 4, 1, 5);
   * console.log(Array.from(arr)); // [1, 1, 3, 4, 5]
   * ```
   */
  push(...items) {
    if(items.length === 0) {
      return this;
    }
    const array = this.array;
    const threshold = Math.min(10, Math.max(1, Math.floor(array.length * 0.1)));
    if(threshold <= items.length) {
      array.push(...items);
      array.sort(this.compare);
      this.size = this.array.length;
      return this;
    }

    items.forEach(item => {
      let low = 0;
      let high = array.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const other = array[mid];
        const result = this.compare(item, other);
        if (result < 0) {
          high = mid - 1;
        } else if(0 < result) {
          low = mid + 1;
        } else {
          break;
        }
      }
      array.splice(low, 0, item);
    });
    this.size = this.array.length;
    return this;
  }

  /**
   * Removes and returns the first element from the array.
   * 
   * @returns {*|undefined} The first element or undefined if array is empty
   */
  shift() {
    const first = this.array.shift();
    this.size = this.array.length;
    return first;
  }

  /**
   * Removes and returns the last element from the array.
   * 
   * @returns {*|undefined} The last element or undefined if array is empty
   */
  pop() {
    const last = this.array.pop();
    this.size = this.array.length;
    return last;
  }

  /**
   * Finds the index of the first element that matches the predicate using binary search.
   * 
   * @param {Function} [cb=noop] - Predicate function that returns 0 for match, <0 for less, >0 for greater
   * @returns {number} The index of the matching element or -1 if not found
   * 
   * @example
   * ```javascript
   * const arr = new OrderedArray();
   * arr.push(1, 3, 5, 7, 9);
   * 
   * // Find index of 5
   * const index = arr.findIndex(x => x - 5); // Returns 2
   * 
   * // Find index of object with id 3
   * const users = new OrderedArray((a, b) => a.id - b.id);
   * users.push({ id: 1 }, { id: 3 }, { id: 5 });
   * const userIndex = users.findIndex(user => user.id - 3); // Returns 1
   * ```
   */
  findIndex(cb = noop) {
    const array = this.array;
    
    let low = 0;
    let high = array.length - 1;

    // Binary search
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const value = array[mid];
      const result = cb(value);
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
   * Finds the first element that matches the predicate.
   * 
   * @param {Function} [cb=noop] - Predicate function that returns 0 for match, <0 for less, >0 for greater
   * @returns {*|undefined} The matching element or undefined if not found
   */
  find(cb = noop) {
    const index = this.findIndex(cb);
    return index === -1 ? void(0) : this.array[index];
  }

  /**
   * Finds the lower bound of the first element that matches the predicate.
   * 
   * @param {Function} predicate - Predicate function that returns 0 for match, <0 for less, >0 for greater
   * @param {number} [hint=null] - Optional hint for the starting index
   * @returns {number} The lower bound index or -1 if not found
   * 
   * @example
   * ```javascript
   * const arr = new OrderedArray();
   * arr.push(1, 2, 2, 2, 3, 4);
   * 
   * // Find lower bound of 2s
   * const lower = arr.lower(x => x - 2); // Returns 1 (first occurrence of 2)
   * ```
   */
  lower(predicate, hint = null) {
    const max = this.array.length - 1;
    let index = hint ?? this.findIndex(predicate);
    if(!(0 <= index && index <= max)) {
      return -1;
    }
    while(0 < index) {
      const obj = this.array[index - 1];
      const match = predicate(obj);
      if(match !== 0) {
        break;
      }
      --index;
    }
    return index;
  }

  /**
   * Finds the upper bound of the last element that matches the predicate.
   * 
   * @param {Function} predicate - Predicate function that returns 0 for match, <0 for less, >0 for greater
   * @param {number} [hint] - Optional hint for the starting index
   * @returns {number} The upper bound index or -1 if not found
   * 
   * @example
   * ```javascript
   * const arr = new OrderedArray();
   * arr.push(1, 2, 2, 2, 3, 4);
   * 
   * // Find upper bound of 2s
   * const upper = arr.upper(x => x - 2); // Returns 3 (last occurrence of 2)
   * ```
   */
  upper(predicate, hint) {
    const max = this.array.length - 1;
    let index = hint ?? this.findIndex(predicate);
    if(!(0 <= index && index <= max)) {
      return -1;
    }
    
    while(index < max) {
      const obj = this.array[index + 1];
      const match = predicate(obj);
      if(match !== 0) {
        break;
      }
      ++index;
    }
    return index;
  }

  /**
   * Finds the range of elements that match the predicate.
   * 
   * @param {Function} cb - Predicate function that returns 0 for match, <0 for less, >0 for greater
   * @returns {Array<number>|undefined} Array with [lower, upper] bounds or undefined if not found
   * 
   * @example
   * ```javascript
   * const arr = new OrderedArray();
   * arr.push(1, 2, 2, 2, 3, 4);
   * 
   * // Find range of 2s
   * const [lower, upper] = arr.range(x => x - 2);
   * console.log(lower, upper); // 1, 3
   * 
   * // Iterate over all 2s
   * for(let i = lower; i <= upper; i++) {
   *   console.log(arr.at(i)); // Prints 2, 2, 2
   * }
   * ```
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
   * Finds the index of an item in the array.
   * 
   * @param {*} item - The item to find
   * @returns {number} The index of the item or -1 if not found
   */
  indexOf(item) {
    return this.array.indexOf(item);
  }
  
  /**
   * Deletes an element at the specified index.
   * 
   * @param {number} [index=0] - The index to delete
   * @returns {OrderedArray} This instance for chaining
   */
  delete(index = 0) {
    this.array.splice(index, 1);
    return this;
  }

  /**
   * Returns an iterator of [index, value] pairs.
   * 
   * @returns {Iterator} Iterator of [index, value] pairs
   */
  entries() {
    return this.array.entries();
  }

  /**
   * Returns an iterator of array indices.
   * 
   * @returns {Iterator} Iterator of indices
   */
  keys() {
    return this.array.keys();
  }

  /**
   * Returns an iterator of array values.
   * 
   * @returns {Iterator} Iterator of values
   */
  values() {
    return this.array.values();
  }

  /**
   * Checks if the array includes a value.
   * 
   * @param {*} v - The value to check for
   * @returns {boolean} True if the value is found
   */
  includes(v) {
    return this.findIndex(obj => this.compare(obj, v)) !== -1;
  }
  
  /**
   * Returns an iterator for the array values.
   * 
   * @returns {Iterator} Iterator of array values
   */
  [Symbol.iterator]() {
    return this.values();
  }

};