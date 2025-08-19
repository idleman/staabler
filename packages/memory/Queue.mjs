import autobind from '@staabler/core/autobind.mjs';
import ConditionVariable from './ConditionVariable.mjs';
//  We use a empty slot to difference between a full and
//  empty because it is the only thread safe alternative
//  https://embeddedartistry.com/blog/2017/05/17/creating-a-circular-buffer-in-c-and-c/

/**
 * Index constants for queue metadata.
 * @type {number}
 */
const INDEX_HEAD = 0;

/**
 * Index constants for queue metadata.
 * @type {number}
 */
const INDEX_TAIL = 1;

/**
 * A memory queue implementation using a circular buffer.
 * Provides high-performance data transfer between threads without mutexes.
 * Uses an empty slot to differentiate between full and empty states.
 * Reference: https://embeddedartistry.com/blog/2017/05/17/creating-a-circular-buffer-in-c-and-c/
 */
export default class Queue {

  /**
   * Creates a new Queue instance on top of an ArrayBuffer/SharedArrayBuffer.
   * Does not use mutexes - external synchronization must be added if needed.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @param {number} [byteLength=Infinity] - Maximum byte length for the queue
   * @param {TypedArrayConstructor} [ArrayType=Uint32Array] - Typed array constructor for queue elements
   */
  constructor(buffer, byteOffset = 0, byteLength = Infinity, ArrayType = Uint32Array) {
    autobind(this); 
    this.buffer = buffer;
    this.byteOffset = byteOffset;
    this.meta = new Uint32Array(buffer, byteOffset, 2); // [head, tail]
    this.array = new ArrayType(buffer, byteOffset + this.meta.byteLength, (Math.min(byteLength, buffer.byteLength - byteOffset - this.meta.byteLength))/ArrayType.BYTES_PER_ELEMENT); // So we can store negatiev values as well
    this.byteLength = this.meta.byteLength + this.array.byteLength;
    
    this.head = new ConditionVariable(buffer, byteOffset);
    this.tail = new ConditionVariable(buffer, byteOffset + 4);
  }

  /**
   * Checks if the queue is empty.
   * 
   * @returns {boolean} True if the queue is empty, false otherwise
   */
  isEmpty() {
    const meta = this.meta;
    return Atomics.load(meta, INDEX_HEAD) === Atomics.load(meta, INDEX_TAIL);
  }
  
  /**
   * Returns the current capacity of the queue (number of items that can be stored).
   * 
   * @returns {number} The capacity of the queue
   */
  capacity() {
    return this.array.length;
  }

  /**
   * Returns the current number of items in the queue.
   * 
   * @returns {number} The number of items in the queue
   */
  size() {
    const meta = this.meta;
    const head = Atomics.load(meta, INDEX_HEAD);
    const tail = Atomics.load(meta, INDEX_TAIL);
    return  (head === tail) ? 0 :
            (tail < head) ? this.array.length - head + tail :
            (tail - head);
  }

  /**
   * Peeks at an item at the specified position without removing it.
   * 
   * @param {number} [pos=0] - Position to peek at (0 = front of queue)
   * @returns {*} The item at the position or undefined if out of bounds
   */
  peek(pos = 0) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, INDEX_HEAD);
    const tail = Atomics.load(meta, INDEX_TAIL);
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);
    return (pos < 0 || size <= pos) ? void(0) : array.at(((head + pos)%length));
  }

  /**
   * Attempts to push a value to the end of the queue.
   * 
   * @param {*} [value=0] - Value to push to the queue
   * @returns {boolean} True if the value was pushed successfully, false if queue is full
   */
  tryPush(value = 0) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    
    
    const head = Atomics.load(meta, INDEX_HEAD);
    const tail = Atomics.load(meta, INDEX_TAIL);
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);

    const capacity = length - size - 1;
    if(capacity <= 0) {
      // Or retry N times.
      return false;
    }
      
    //  Because the reader thread may run right before the compareExchange or right
    //  after do we need to set the value twice.
    const next = (tail + 1)%length;
    Atomics.store(array, tail, value);
    if(Atomics.compareExchange(meta, INDEX_TAIL, tail, next) === tail) {
      // The update were successful
      Atomics.store(array, tail, value);
      return true;
    }
    return false;
  }

  /**
   * Pushes a value to the end of the queue with a timeout.
   * 
   * @param {*} value - Value to push to the queue
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {*} The pushed value
   * @throws {Error} If push operation fails due to timeout
   */
  push(value, timeout = 0) {
    if(timeout <= 0) {
      if(!this.tryPush(value)) {
        throw new Error(`Queue.write() failed`);
      }
      return value;
    }
    const head = this.head;
    const start = performance.now();
    while(true) {
      const state = head.value();
      const success = this.tryPush(value);
      if(success) {
        return value;
      }
      const elapsed = performance.now() - start;
      if(timeout <= elapsed) {
        throw new Error(`Queue.write() failed`);
      }
      head.wait(state, timeout - elapsed);
    }
  }

  /**
   * Asynchronously pushes a value to the end of the queue with a timeout.
   * 
   * @param {*} value - Value to push to the queue
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {Promise<*>} Promise that resolves to the pushed value
   * @throws {Error} If push operation fails due to timeout
   */
  async pushAsync(value, timeout = 0) {
    if(timeout <= 0) {
      if(!this.tryPush(value)) {
        throw new Error(`Queue.write() failed`);
      }
      return value;
    }
    const head = this.head;
    const start = performance.now();
    while(true) {
      const state = head.value();
      const success = this.tryPush(value);
      if(success) {
        return value;
      }
      const elapsed = performance.now() - start;
      if(timeout <= elapsed) {
        throw new Error(`Queue.write() failed`);
      }
      await head.waitAsync(state, timeout - elapsed);
    }
  }

  /**
   * Attempts to shift (remove and return) a value from the front of the queue.
   * 
   * @param {*} [defaultValue] - Default value to return if queue is empty
   * @returns {*} The shifted value or the default value if queue is empty
   */
  tryShift(defaultValue) {
    const meta = this.meta;
    const array = this.array;
    const length = array.length;
    const head = Atomics.load(meta, INDEX_HEAD);
    const tail = Atomics.load(meta, INDEX_TAIL);
    
    const size =  (head == tail) ? 0 :
                  (tail < head) ? length - head + tail :
                  (tail - head);

    if(size <= 0) {
      return defaultValue;
    }

    const next = (head + 1)%length;
    const value = Atomics.load(array, head);
    if(Atomics.compareExchange(meta, INDEX_HEAD, head, next) === head) {
      return value;
    }
    return defaultValue;
  }

  /**
   * Shifts (removes and returns) a value from the front of the queue with a timeout.
   * 
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @param {*} [defaultValue] - Default value to return if timeout occurs
   * @returns {*} The shifted value or the default value if timeout occurs
   */
  shift(timeout = 0, defaultValue = void(0)) {
    if(timeout === 0) {
      return this.tryShift(defaultValue);
    }

    const tail = this.tail;
    const start = performance.now();
    while(true) {
      const state = tail.value();
      const value = this.tryShift(defaultValue);
      if(value !== defaultValue) {
        return value;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return;
      }
      tail.wait(state,  timeout - elapsed);
    }
  }

  /**
   * Asynchronously shifts (removes and returns) a value from the front of the queue with a timeout.
   * 
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @param {*} [defaultValue] - Default value to return if timeout occurs
   * @returns {Promise<*>} Promise that resolves to the shifted value or default value if timeout
   */
  async shiftAsync(timeout = 0, defaultValue = void(0)) {
    if(timeout === 0) {
      return this.tryShift(defaultValue);
    }

    const meta = this.meta;
    const start = performance.now();
    while(true) {
      const state = Atomics.load(meta, INDEX_TAIL);
      const value = this.tryShift(defaultValue);
      if(value !== defaultValue) {
        return value;
      }
      const elapsed = performance.now() - start;
      if(timeout < elapsed) {
        return;
      }
      await Atomics.waitAsync(meta, INDEX_TAIL, state, Math.min(17, elapsed));
    }
  }

};