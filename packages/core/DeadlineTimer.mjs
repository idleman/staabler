import noop from './noop.mjs';
import autobind from './autobind.mjs';

const maxSetTimeoutValue = 2**31 - 1;

/**
 * A timer that fires a callback after a specified deadline.
 * 
 * Unlike setTimeout, DeadlineTimer ensures the callback is called after
 * the exact deadline has passed, even if the system is busy. It handles
 * the setTimeout maximum value limitation by using multiple timeouts if needed.
 * 
 * @example
 * const timer = new DeadlineTimer(() => console.log('Deadline reached!'), 5000);
 * 
 * // Later, if needed:
 * timer.abort(); // Cancel the timer
 * 
 * @example
 * // Reset the timer
 * const timer = new DeadlineTimer(() => console.log('Done'), 1000);
 * timer.reset(() => console.log('New deadline'), 2000);
 */
export default class DeadlineTimer {

  /**
   * Creates a new DeadlineTimer instance.
   * 
   * @param {Function} [cb=noop] - The callback function to execute when the deadline is reached
   * @param {number} [ms=0] - The deadline in milliseconds
   * @param {...any} args - Additional arguments to pass to the callback
   * 
   * @example
   * const timer = new DeadlineTimer(
   *   (message) => console.log(message),
   *   1000,
   *   'Timer completed'
   * );
   */
  constructor(cb = noop, ms = 0, ...args) {
    autobind(this);
    this.cb = cb;
    this.args = cb ? args : null;
    this.end = cb ? (performance.now()) + ms : 0;
    this._setTimeoutId = cb ? setTimeout(this.handleTimeout, Math.min(ms, maxSetTimeoutValue)) : null;
  }
  
  /**
   * Resets the timer with new callback and deadline.
   * 
   * Cancels the current timer and starts a new one with the provided parameters.
   * 
   * @param {Function} [cb=noop] - The new callback function
   * @param {number} [ms=0] - The new deadline in milliseconds
   * @param {...any} args - Additional arguments to pass to the callback
   * 
   * @example
   * const timer = new DeadlineTimer(() => console.log('First'), 1000);
   * 
   * // Reset after 500ms
   * setTimeout(() => {
   *   timer.reset(() => console.log('Second'), 2000);
   * }, 500);
   */
  reset(cb = noop, ms = 0, ...args) {
    if(this._setTimeoutId !== null) {
      clearTimeout(this._setTimeoutId);
    }

    if(cb) {
      this.cb = cb;
      this.args = args;
      this.end = (performance.now()) + ms;
    }
    
    if(this.cb) {
      this._setTimeoutId = setTimeout(this.handleTimeout, Math.min(ms, maxSetTimeoutValue));
    }
  }

  /**
   * Aborts the timer, preventing the callback from being called.
   * 
   * Clears the timeout and resets the timer state.
   * 
   * @example
   * const timer = new DeadlineTimer(() => console.log('Never called'), 1000);
   * timer.abort(); // Timer is cancelled
   */
  abort() {
    this.cb = null;
    this.args = null;
    this.end = 0;
    if(this._setTimeoutId !== null) {
      clearTimeout(this._setTimeoutId);
      this._setTimeoutId = null;
    }
  }

  /**
   * Internal method that handles the timeout logic.
   * 
   * Checks if the deadline has been reached and either calls the callback
   * or schedules another timeout if more time is needed.
   * 
   * @private
   */
  handleTimeout() {
    const end = this.end;
    const now = performance.now();
    if(now < end) {
      const remaining = Math.max(0, end - now);
      this._setTimeoutId = setTimeout(this.handleTimeout, Math.min(remaining, maxSetTimeoutValue));
      return;
    }
    const cb = this.cb;
    if(!cb) {
      return;
    }

    const args = this.args;
    this.cb = null;
    this.args = null;
    this._setTimeoutId = null;
    cb(...args);
    return;
  }
  
};