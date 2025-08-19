import noop from './noop.mjs';

/**
 * Adds an event listener to an object and returns a cleanup function.
 * 
 * This utility function provides a convenient way to add event listeners
 * and automatically handle cleanup by returning a function that removes
 * the listener when called.
 * 
 * @param {EventTarget} obj - The object to add the event listener to (e.g., DOM element, EventEmitter)
 * @param {string} [type=''] - The type of event to listen for
 * @param {Function} [cb=noop] - The callback function to execute when the event occurs
 * @returns {Function} A cleanup function that removes the event listener when called
 * 
 * @example
 * // Add a click listener to a button
 * const cleanup = addEventListener(button, 'click', () => console.log('clicked'));
 * 
 * // Later, remove the listener
 * cleanup();
 * 
 * @example
 * // With default parameters
 * const cleanup = addEventListener(element); // Uses empty string and noop
 */
export default function addEventListener(obj, type = '', cb = noop) {
  obj.on?.(type, cb);
  obj.addEventListener?.(type, cb);
  return () => {
    obj.removeListener?.(type, cb);
    obj.removeEventListener?.(type, cb);
  };
};