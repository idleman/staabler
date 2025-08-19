/**
 * A FIFO (First In, First Out) queue implementation.
 * More efficient than using Array#shift for large queues.
 * 
 * @example
 * const queue = new Queue();
 * 
 * // Add items
 * queue.push(1);
 * queue.push(2);
 * queue.push(3);
 * 
 * // Remove items in FIFO order
 * console.log(queue.shift()); // 1
 * console.log(queue.shift()); // 2
 * console.log(queue.shift()); // 3
 * 
 * // Peek at front/back
 * queue.push(4, 5, 6);
 * console.log(queue.front()); // 4
 * console.log(queue.back());  // 6
 * 
 * // With initial capacity
 * const largeQueue = new Queue(1000);
 */
export default class Queue {
  
  /**
   * Creates a new Queue instance.
   * 
   * @param {number} [capacity=0] - Initial capacity of the queue
   */
  constructor(capacity = 0) {

    this.capacity = capacity;
    this.array = Array.from({ length: capacity });
    this.head = 0;
    this.tail = 0;
    this.length = 0;
  }
  
  /**
   * Gets the front element without removing it.
   * 
   * @returns {*|undefined} The front element or undefined if queue is empty
   */
  peek() {
    return this.front();
  }

  /**
   * Gets the front element without removing it.
   * 
   * @returns {*|undefined} The front element or undefined if queue is empty
   */
  front() {
    if(this.length) {
      const array = this.array;
      const index = (this.head)%array.length;
      return array[index];
    }
  }

  /**
   * Gets the back element without removing it.
   * 
   * @returns {*|undefined} The back element or undefined if queue is empty
   */
  back() {
    if(this.length) {
      const array = this.array;
      const index = (this.tail-1)%array.length;
      return array[index];
    }
  }

  /**
   * Adds an element to the back of the queue.
   * Automatically grows the queue if needed.
   * 
   * @param {*} v - The value to add to the queue
   */
  push(v) {
    if(this.length === this.array.length) {
      this.grow();
    }
    const index = (this.tail++)%this.array.length;
    this.array[index] = v;
    ++this.length;
  }

  /**
   * Removes and returns the front element from the queue.
   * 
   * @returns {*|undefined} The front element or undefined if queue is empty
   */
  shift() {
    if(this.length === 0) {
      return;
    }
    const array = this.array;
    const index = (this.head++)%array.length;
    const value = array[index];
    array[index] = void(0); // help GC
    --this.length;
    return value;
  }
  
  /**
   * Clears all elements from the queue.
   */
  clear() {
    this.head = 0;
    this.tail = 0;
    this.array = [];
    this.length = 0;
    this.capacity = 0;
  }

  /**
   * Assigns the state of another queue to this one.
   * 
   * @param {Queue} tmp - The queue to copy state from
   * @returns {Queue} This instance for chaining
   */
  assign(tmp) {
    this.head = tmp.head;
    this.tail = tmp.tail;
    this.array = tmp.array;
    this.length = tmp.length;
    this.capacity = tmp.capacity;
    return this;
  }
  
  /**
   * Grows the queue capacity by doubling it.
   * Preserves all existing elements.
   * 
   * @returns {Queue} This instance for chaining
   */
  grow() {
    const length = this.length;
    const tmp = new Queue(Math.max(1, this.capacity * 2));
    for(let i = 0; i < length; ++i) {
      tmp.push(this.shift());
    }
    return this.assign(tmp);
  }

};