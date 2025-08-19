import noop from './noop.mjs';

/**
 * Creates a function that executes with a specified delay.
 * If delay is 0 or negative, the function executes immediately.
 * 
 * @param {number} delay - The delay in milliseconds (default: 0)
 * @param {Function} cb - The function to execute (default: noop)
 * @returns {Function} A function that executes the callback after the specified delay
 * 
 * @example
 * const delayedLog = withDelay(1000, (message) => {
 *   console.log(message);
 * });
 * 
 * delayedLog('Hello after 1 second');
 * // Logs 'Hello after 1 second' after 1 second
 * 
 * @example
 * const immediateLog = withDelay(0, (message) => {
 *   console.log(message);
 * });
 * 
 * immediateLog('Hello immediately');
 * // Logs 'Hello immediately' immediately
 */
export default function withDelay(delay = 0, cb = noop) {
  return  (delay <= 0) ? (...args) => void(cb(...args)) :
          (...args) => void(setTimeout(() => void(cb(...args)), delay));
  
};