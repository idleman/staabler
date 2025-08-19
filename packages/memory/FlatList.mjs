import LRUMap from '@staabler/core/LRUMap.mjs';
import withCache from '@staabler/core/withCache.mjs';
import Allocator from '@staabler/core/Allocator.mjs';

const emptyArrayBuffer = new Uint8Array(0);

/**
 * Default comparison function for sorting FlatList items.
 * Uses Buffer.compare for binary comparison of item buffers.
 * 
 * @param {Object} a - First item to compare
 * @param {Object} b - Second item to compare
 * @returns {number} Comparison result (-1, 0, or 1)
 */
const defaultCompare = (a, b) => Buffer.compare(a.buffer, b.buffer);

/**
 * A memory-efficient list implementation that stores items in a contiguous buffer.
 * Provides array-like functionality with minimal memory overhead.
 */
class FlatList  {
  
  /**
   * Creates a new FlatList instance.
   * 
   * @param {Function} Type - Constructor function for list items
   * @param {Uint8Array} [buffer=emptyArrayBuffer] - Initial buffer for the list
   * @param {Allocator} [allocator=Allocator.getInstance()] - Memory allocator instance
   * @throws {Error} If Type.BYTES_PER_ELEMENT is not a positive integer
   * @throws {Error} If buffer length is not a multiple of BYTES_PER_ELEMENT
   */
  constructor(Type, buffer = emptyArrayBuffer, allocator = Allocator.getInstance()) {
    this.Type = Type;
    this.buffer = buffer ?? emptyArrayBuffer;
    this.allocator = allocator;
    
    
    const { BYTES_PER_ELEMENT } = Type;
    if(!(BYTES_PER_ELEMENT && 0 < BYTES_PER_ELEMENT)) {
      throw new Error(`FlatList<constructor>: Type.BYTES_PER_ELEMENT must be a positive integer`);
    }
    const byteLength = this.buffer.byteLength;
    if(byteLength && byteLength%BYTES_PER_ELEMENT !== 0) {
      throw new Error(`FlatList<constructor>: buffer length (${byteLength}) must be a multiple of ${BYTES_PER_ELEMENT}`);
    }
    this.length = byteLength/BYTES_PER_ELEMENT;
    this._handle = new Type();
    this._handleByteOffset = -1;
    this._objects = new LRUMap(2**4);
    //this._at = withCache(this._objects, this._at.bind(this));
  }

  /**
   * Resizes the list to the specified length.
   * 
   * @param {number} [len=0] - New length for the list
   * @returns {FlatList} This instance for chaining
   */
  resize(len = 0) {
    const length = len < 0 ? 0 : len;
    if(this.length < length) {
      this.reserve(length);
    }
    this.length = length;
    return this;
  }

  /**
   * Ensures the buffer has enough capacity for the specified number of items.
   * 
   * @param {number} [len=0] - Minimum number of items to reserve space for
   * @param {boolean} [force=false] - Force reallocation even if current capacity is sufficient
   * @returns {FlatList} This instance for chaining
   */
  reserve(len = 0, force = false) {
    
    const buffer = this.buffer;
    const minByteLength = this.Type.BYTES_PER_ELEMENT * len;
    if(minByteLength < 0 || buffer.byteLength === minByteLength) {
      return this;
    }

    if(buffer.byteLength < minByteLength || force) {
      const curr = this.buffer;
      const allocator = this.allocator;
      const next = allocator.construct(minByteLength);
      next.set(curr);
      this.buffer = next;
      allocator.destruct(curr);
      this._objects.clear();
    }
    return this;
  }

  /**
   * Reduces buffer size to fit the current number of items.
   * 
   * @returns {FlatList} This instance for chaining
   */
  shrinkToFit() {
    return this.reserve(this.length, true);
  }
  
  /**
   * Gets a handle to an item at the specified position.
   * 
   * @param {number} [pos=0] - Position of the item (negative values count from end)
   * @returns {Object|undefined} Item handle or undefined if position is out of bounds
   */
  handle(pos = 0) {
    if(pos < 0) {
      return this.handle(this.length + pos);
    }
    if(this.length <= pos) {
      return;
    }
    const Type = this.Type;
    const handle = this._handle;
    const { BYTES_PER_ELEMENT } = Type;
    const index = pos < 0 ? this.length + pos : pos;
    const byteOffset = BYTES_PER_ELEMENT * index;
    if(handle.buffer !== this.buffer || this._handleByteOffset !== byteOffset) {
      handle.buffer = this.buffer.subarray(byteOffset, byteOffset + BYTES_PER_ELEMENT);
      this._handleByteOffset = byteOffset;
    }
    return handle;
  }

  /**
   * Converts the list to a JavaScript array.
   * 
   * @returns {Array} Array containing all items converted to JavaScript objects
   */
  toJS() {
    return Array.from({ length: this.length }, (_1, index) => this.at(index).toJS());
  }
  

  /**
   * Internal method to get an item at the specified index.
   * 
   * @param {number} [index=0] - Index of the item
   * @returns {Object} New instance of the item type
   * @private
   */
  _at(index = 0) {
    
    const Type = this.Type;
    const { BYTES_PER_ELEMENT } = Type;
    const byteOffset = BYTES_PER_ELEMENT * index;
    return new Type(this.buffer.subarray(byteOffset, byteOffset + BYTES_PER_ELEMENT));
  }

  /**
   * Gets an item at the specified position.
   * 
   * @param {number} [pos=0] - Position of the item (negative values count from end)
   * @returns {Object|undefined} Item at the position or undefined if out of bounds
   */
  at(pos = 0) {
    return  (pos < 0) ? this.at(this.length + pos) :
            (this.length <= pos) ? void(0) :
            this._at(pos);
  }

  /**
   * Sets an item at the specified index.
   * 
   * @param {number} index - Index where to set the item
   * @param {Object} obj - Item to set
   * @returns {FlatList} This instance for chaining
   */
  set(index, obj) {
    
    if(index < 0) {
      return this.set(this.length + pos, obj);
    }
    if(!obj) {
      return this;
    }
    if(this.length <= index) {
      this.resize(index + 1);
    }
    const Type = this.Type;
    const { BYTES_PER_ELEMENT } = Type;
    const byteOffset = BYTES_PER_ELEMENT * index;
    
    const object = obj instanceof Type ? obj : (new Type(obj));
    const source = object.buffer;
    this.buffer.set(source, byteOffset);
    return this;
  }

  /**
   * Adds one or more items to the end of the list.
   * 
   * @param {...Object} args - Items to add
   * @returns {FlatList} This instance for chaining
   */
  push(...args) {
    const length = this.length;
    const argsLength = args.length;
    this.resize(length + argsLength);
    for(let i = 0; i < argsLength; ++i) {
      this.set(length + i, args[i]);
    }
    return this;
  }

  /**
   * Removes the last item from the list.
   * 
   * @returns {FlatList} This instance for chaining
   */
  pop() {
    if(this.length) {
      this.resize(this.length - 1);
    }
    return this;
  }

  /**
   * Adds an item to the beginning of the list.
   * 
   * @param {Object} obj - Item to add
   * @returns {FlatList} This instance for chaining
   */
  unshift(obj) {
    return this.insert(0, obj);
  }

  /**
   * Removes the first item from the list.
   * 
   * @returns {FlatList} This instance for chaining
   */
  shift() {
    const length = this.length;
    if(length) {
      const { BYTES_PER_ELEMENT } = this.Type;
      this.buffer.copyWithin(0, BYTES_PER_ELEMENT, BYTES_PER_ELEMENT*length);
      this.resize(length - 1);
    }
    return this;
  }

  /**
   * Inserts an item at the specified index.
   * 
   * @param {number} index - Index where to insert the item
   * @param {Object} obj - Item to insert
   * @returns {FlatList} This instance for chaining
   */
  insert(index, obj) {
    const isLastIndex = this.length === index;
    this.resize(this.length + 1);
      
    const { BYTES_PER_ELEMENT } = this.Type;
    
    if(!isLastIndex) {
      const start = BYTES_PER_ELEMENT*index;
      const target = BYTES_PER_ELEMENT*(index+1);
      const end = this.length*BYTES_PER_ELEMENT;
      this.buffer.copyWithin(target, start, end);
    }
    this.set(index, obj);
    return this;
  }

  /**
   * Removes an item at the specified index.
   * 
   * @param {number} index - Index of the item to remove
   * @returns {FlatList} This instance for chaining
   */
  delete(index) {
    if(!(0 <= index && index < this.length)) {
      return this;
    }
    const { BYTES_PER_ELEMENT } = this.Type;
    const source = BYTES_PER_ELEMENT*(index + 1);
    const destination = BYTES_PER_ELEMENT*index;
    this.buffer.copyWithin(destination, source);
    this.resize(this.length - 1);
    return this;
  }

  /**
   * Swaps two items in the list.
   * 
   * @param {number} indexA - Index of first item
   * @param {number} indexB - Index of second item
   * @returns {FlatList} This instance for chaining
   */
  swap(indexA, indexB) {
    if (indexA === indexB) {
      return this;
    }
    const buffer = this.buffer;
    const allocator = this.allocator;
    const { BYTES_PER_ELEMENT } = this.Type;
    const offsetA = indexA*BYTES_PER_ELEMENT;
    const offsetB = indexB*BYTES_PER_ELEMENT;
    const tmp = allocator.construct(BYTES_PER_ELEMENT);
    
    tmp.set(buffer.subarray(offsetA, offsetA + BYTES_PER_ELEMENT));
    buffer.set(buffer.subarray(offsetB, offsetB + BYTES_PER_ELEMENT), offsetA);
    buffer.set(tmp, offsetB);
    allocator.destruct(tmp);
    return this;
  }

  /**
   * Returns an iterator for [index, item] pairs.
   * 
   * @returns {Iterator} Iterator yielding [index, item] pairs
   */
  *entries() {
    for(let i = 0; i < this.length; ++i) {
      yield [i, this.at(i)];
    }
  }

  /**
   * Returns an iterator for indices.
   * 
   * @returns {Iterator} Iterator yielding indices
   */
  *keys() {
    for(const [key, _] of this.entries()) {
      yield key;
    }
  }

  /**
   * Returns an iterator for items.
   * 
   * @returns {Iterator} Iterator yielding items
   */
  *values() {
    for(const [_, value] of this.entries()) {
      yield value;
    }
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
    return this.toJS().map(cb);
  }

  /**
   * Creates a new array with items that pass the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {Array} New array with filtered items
   */
  filter(cb) {
    return this.toJS().filter(cb);
  }

  /**
   * Executes a function for each item in the list.
   * 
   * @param {Function} cb - Function to execute for each item
   * @returns {FlatList} This instance for chaining
   */
  forEach(cb) {
    const length = this.length;
    for(let i = 0; i < length; ++i) {
      cb(this.handle(i), i, this);
    }
    return this;
  }

  /**
   * Returns the first item that satisfies the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {Object|undefined} First matching item or undefined
   */
  find(cb) {
    const index = this.findIndex(cb);
    return index === -1 ? void(0) : this.at(index);
  }

  /**
   * Returns the index of the first item that satisfies the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {number} Index of first matching item or -1
   */
  findIndex(cb) {
    const length = this.length;
    for(let i = 0; i < length; ++i) {
      if(cb(this.handle(i), i, this)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Reduces the list to a single value by executing a function for each item.
   * 
   * @param {Function} cb - Reducer function
   * @param {*} state - Initial state
   * @returns {*} Final state
   */
  reduce(cb, state) {
    const length = this.length;
    for(let i = 0; i < length; ++i) {
      state = cb(state, this.handle(i), i, this); 
    }
    return state;
  }

  /**
   * Tests whether at least one item passes the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {boolean} True if at least one item passes the test
   */
  some(cb) {
    return this.findIndex(cb) !== -1;
  }

  /**
   * Tests whether all items pass the test function.
   * 
   * @param {Function} cb - Test function
   * @returns {boolean} True if all items pass the test
   */
  every(cb) {
    const length = this.length;
    for(let i = 0; i < length; ++i) {
      if(!cb(this.handle(i), i, this)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sorts the list using the specified comparison function.
   * Uses heap sort algorithm for optimal performance.
   * 
   * @param {Function} [compareFn=defaultCompare] - Comparison function
   * @returns {FlatList} This instance for chaining
   */
  sort(compareFn = defaultCompare) {
    if (this.length <= 1) {
      return this;
    }
    
    // Heap sort. Machine generated code below.
    
    const Type = this.Type;
    const { BYTES_PER_ELEMENT } = Type;
    
    // Reuse these objects for comparisons to avoid allocations
    const itemA = new Type();
    const itemB = new Type();
    
    // Helper function to get item at index i
    const getItem = (i, target) => {
      target.buffer = this.buffer.subarray(i * BYTES_PER_ELEMENT, (i + 1) * BYTES_PER_ELEMENT);
      return target;
    };
    
    // Helper function to compare two items at indices i and j
    const compare = (i, j) => compareFn(getItem(i, itemA), getItem(j, itemB));
    
    // Helper function to swap items at indices i and j
    const swapItems = (i, j) => this.swap(i, j);
    
    // Helper function to sift down in the heap
    const siftDown = (start, end) => {
      let root = start;
      
      while (2 * root + 1 <= end) {
        const child = 2 * root + 1;
        let swap = root;
        
        // Compare root with left child
        if (compare(swap, child) < 0) {
          swap = child;
        }
        
        // If right child exists, compare with current largest
        if (child + 1 <= end && compare(swap, child + 1) < 0) {
          swap = child + 1;
        }
        
        // If root is largest, we're done
        if (swap === root) {
          return;
        }
        
        // Otherwise, swap and continue sifting down
        swapItems(root, swap);
        root = swap;
      }
    };
    
    // Build the heap (heapify)
    for (let i = Math.floor(this.length / 2) - 1; i >= 0; i--) {
      siftDown(i, this.length - 1);
    }
    
    // Extract elements from the heap one by one
    for (let i = this.length - 1; i > 0; i--) {
      // Move current root to end
      swapItems(0, i);
      
      // Call siftDown on the reduced heap
      siftDown(0, i - 1);
    }
    
    return this;
  }

  /**
   * Reverses the order of items in the list.
   * 
   * @returns {FlatList} This instance for chaining
   */
  reverse() {
    const length = this.length;
    for(let i = 0; i < length/2; ++i) {
      this.swap(i, length - 1 - i);
    }
    return this;
  }
  
  
};

/**
 * Creates a FlatList class for a specific Record type.
 * 
 * @param {Function} Record - Record constructor function
 * @returns {Function} FlatList class specialized for the Record type
 */
export default withCache(new WeakMap(), Record => {

  return class List extends FlatList {

    static BYTES_PER_ELEMENT = Record.BYTES_PER_ELEMENT;

    /**
     * Creates a new List instance for the specified Record type.
     * 
     * @param {...*} args - Arguments to pass to FlatList constructor
     */
    constructor(...args) {
      super(Record, ...args);
    }

  };
});
