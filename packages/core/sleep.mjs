/**
 * Creates a promise that resolves after a specified delay.
 * 
 * Returns a promise that resolves after the given number of milliseconds.
 * The returned promise has an `abort` method that can be used to cancel
 * the sleep early.
 * 
 * @param {number} [ms=0] - The delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay, with an abort method
 * 
 * @example
 * // Basic usage
 * await sleep(1000); // Wait for 1 second
 * console.log('1 second has passed');
 * 
 * @example
 * // With abort functionality
 * const sleepPromise = sleep(5000);
 * 
 * // Cancel the sleep after 1 second
 * setTimeout(() => {
 *   sleepPromise.abort();
 * }, 1000);
 * 
 * await sleepPromise; // Resolves immediately when aborted
 * 
 * @example
 * // In async functions
 * async function processWithDelay() {
 *   console.log('Starting...');
 *   await sleep(2000);
 *   console.log('2 seconds later...');
 * }
 * 
 * @example
 * // Zero delay
 * await sleep(0); // Resolves immediately on next tick
 * 
 * @example
 * // Multiple sleeps
 * async function staggeredLogging() {
 *   console.log('First');
 *   await sleep(100);
 *   console.log('Second');
 *   await sleep(100);
 *   console.log('Third');
 * }
 * 
 * @example
 * // Error handling with abort
 * try {
 *   const sleepPromise = sleep(10000);
 *   
 *   // Some condition that might cause early termination
 *   if (someCondition) {
 *     sleepPromise.abort();
 *   }
 *   
 *   await sleepPromise;
 * } catch (error) {
 *   // Handle any errors
 * }
 */
export default function sleep(ms = 0) {
  const { promise, resolve } = Promise.withResolvers();
  let setTimeoutId = setTimeout(() => {
    setTimeoutId = null;
    resolve();
  }, ms);
  promise.abort = () => {
    if(setTimeoutId !== null) {
      clearTimeout(setTimeoutId);
      setTimeoutId = null;
      resolve();
    }
  };
  return promise;
};