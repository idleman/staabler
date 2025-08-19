import noop from '@staabler/core/noop.mjs';
import Timer from '@staabler/core/Timer.mjs';
import autobind from '@staabler/core/autobind.mjs';
import tryCatch from '@staabler/core/tryCatch.mjs';
import withValue from '@staabler/core/withValue.mjs';

/**
 * Default timeout value for mutex operations (maximum 32-bit integer).
 * @type {number}
 */
const defaultTimeout = 2**31-1;

/**
 * A thread-safe mutex implementation using Atomics.wait and Atomics.notify.
 * Ensures that locked resources don't need to use Atomics.load to ensure updated values.
 */
export default class Mutex {

  /**
   * Creates a new Mutex instance.
   * 
   * @param {ArrayBuffer|SharedArrayBuffer} buffer - The underlying buffer for the mutex
   * @param {number} [byteOffset=0] - Byte offset within the buffer
   */
  constructor(buffer, byteOffset = 0) {
    // Array should be an typed array
    autobind(this);
    this.buffer = buffer;
    this.byteLength = 4;
    this.byteOffset = byteOffset;
    this.view = new Int32Array(buffer, byteOffset, 1);
    this._owner = false;
  }

  /**
   * Checks if the mutex is currently locked.
   * 
   * @returns {boolean} True if the mutex is locked, false otherwise
   */
  isLocked() {
    return Atomics.load(this.view, 0) === 1;
  }
  
  /**
   * Checks if the current thread owns the mutex.
   * 
   * @returns {boolean} True if the current thread owns the mutex, false otherwise
   */
  hasOwnership() {
    return this._owner;
  }
  
  /**
   * Attempts to acquire the mutex lock with a timeout.
   * 
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {boolean} True if lock was acquired, false otherwise
   */
  tryLock(timeout = 0) {
    const view = this.view;
    if(Atomics.wait(view, 0, 1, timeout) !== 'ok' && Atomics.compareExchange(view, 0, 0, 1) === 0) {
      this._owner = true;
      return true;
    }
    return false;
  }

  /**
   * Asynchronously attempts to acquire the mutex lock with a timeout.
   * 
   * @param {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
   * @returns {Promise<boolean>} Promise that resolves to true if lock was acquired, false otherwise
   */
  async tryLockAsync(timeout = 0) {
    const view = this.view;
    const result = await Atomics.waitAsync(view, 0, 1, timeout);
    if(result !== 'ok' && Atomics.compareExchange(view, 0, 0, 1) === 0) {
      this._owner = true;
      return true;
    }
    return false;
  }

  /**
   * Attempts to release the mutex lock.
   * 
   * @returns {boolean} True if lock was released, false otherwise
   */
  tryUnlock() {
    const view = this.view;
    if(this._owner && Atomics.compareExchange(view, 0, 1, 0) === 1) {
      this._owner = false;
      Atomics.notify(view, 0, 1);
      return true;
    }
    return false;
  }

  /**
   * Releases the mutex lock. Throws an error if unlock fails.
   * 
   * @returns {Mutex} This instance for chaining
   * @throws {Error} If unlock operation fails
   */
  unlock() {
    if(!this.tryUnlock()) {
      throw new Error('Unlock failed');
    }
    return this;
  }

  /**
   * Acquires the mutex lock with a timeout.
   * 
   * @param {number} [timeout=defaultTimeout] - Timeout in milliseconds
   * @returns {Mutex} This instance for chaining
   * @throws {Error} If lock acquisition fails due to timeout
   */
  lock(timeout = defaultTimeout) {
    if(this.tryLock()) {
      return this;
    }

    const view = this.view;
    const timer = new Timer();
    while(true) {
      const ms = timeout - timer.elapsed();
      if(this.tryLock(ms)) {
        return this;
      }
      if(ms <= 0) {
        throw new Error('Lock acquisition failed');
      }
    }
  }

  /**
   * Executes a function while holding the mutex lock.
   * Automatically releases the lock when the function completes.
   * 
   * @param {Function} [cb=noop] - Function to execute while holding the lock
   * @param {number} [timeout=defaultTimeout] - Timeout for lock acquisition
   * @returns {*} The result of the callback function
   * @throws {Error} If the callback function throws an error
   */
  post(cb = noop, timeout = defaultTimeout) {
    this.lock(timeout);
    const result = tryCatch(cb);
    return withValue(result, ([value, err]) => {
      this.unlock();
      if(typeof err === 'undefined') {
        return value;
      }
      throw err;
    });
  }

}