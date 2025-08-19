/**
 * Shared array buffer and typed array for sleep operations.
 * @type {SharedArrayBuffer}
 */
const sab = new SharedArrayBuffer(4);

/**
 * Typed array view for the shared array buffer.
 * @type {Int32Array}
 */
const int32 = new Int32Array(sab);

/**
 * Sleeps for the specified number of milliseconds by blocking the current thread.
 * Uses Atomics.wait for efficient thread blocking.
 * 
 * @param {number} [ms=5] - Number of milliseconds to sleep
 */
export default function sleep(ms = 5) {
  Atomics.wait(int32, 0, 0, ms); // blocks the thread
};