import autobind from '@staabler/core/autobind.mjs';

/**
 * A thread-safe condition variable implementation using Atomics.
 * Provides synchronization primitives for multi-threaded applications.
 */
export default class ConditionVariable {

  /**
   * Creates a new ConditionVariable instance.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   * @param {TypedArrayConstructor} [Type=Int32Array] - Typed array constructor for the condition variable
   */
  constructor(buffer, byteOffset = 0, Type = Int32Array) {
    // autobind(this);
    this.buffer = buffer;
    this.byteOffset = byteOffset;
    this.byteLength = Type.BYTES_PER_ELEMENT;
    this.view = new Type(buffer, byteOffset, 1);
  }

  /**
   * Notifies waiting threads.
   * 
   * @param {number} [count=0] - Number of threads to notify (0 = all waiting threads)
   * @returns {number} Number of threads that were notified
   */
  notify(count = 0) {
    return Atomics.notify(this.view, 0, count);
  }

  /**
   * Notifies exactly one waiting thread.
   * 
   * @returns {number} Number of threads that were notified
   */
  notifyOne() {
    return this.notify(1);
  }

  /**
   * Notifies all waiting threads.
   * 
   * @returns {number} Number of threads that were notified
   */
  notifyAll() {
    return this.notify(Infinity);
  }

  /**
   * Gets the current value of the condition variable.
   * 
   * @returns {number} The current value
   */
  value() {
    return Atomics.load(this.view, 0);
  }

  /**
   * Waits for the condition variable to change from the expected value.
   * 
   * @param {number} [expect=0] - Expected value to wait for change from
   * @param {number} [time=Infinity] - Maximum time to wait in milliseconds
   * @returns {string} 'ok' if the value changed, 'timed-out' if timeout occurred, 'not-equal' if value was different
   */
  wait(expect = 0, time = Infinity) {
    return Atomics.wait(this.view, 0, expect, time);
  }

  /**
   * Asynchronously waits for the condition variable to change from the expected value.
   * 
   * @param {number} [expect=0] - Expected value to wait for change from
   * @param {number} [time=Infinity] - Maximum time to wait in milliseconds
   * @returns {Promise<string>} Promise that resolves to 'ok', 'timed-out', or 'not-equal'
   */
  waitAsync(expect = 0, time = Infinity) {
    return Atomics.waitAsync(this.view, 0, expect, time)?.value;
  }

};