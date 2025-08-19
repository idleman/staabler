import autobind from './autobind.mjs';

const defaultGetTime = performance.now ? () => performance.now() : () => Date.now();

/**
 * A utility class for measuring elapsed time and calculating performance metrics.
 * Provides methods to start, stop, and calculate timing information.
 * 
 * @example
 * const timer = new Timer();
 * // ... do some work ...
 * timer.stop();
 * console.log(`Elapsed: ${timer.elapsed()}ms`);
 */
export default class Timer {

  /**
   * Creates a new Timer instance and starts timing.
   */
  constructor(getTime = defaultGetTime) {
    autobind(this);
    this.stopped = 0;
    this.started = getTime();
    this.getTime = getTime;
  }

  /**
   * Resets the timer and starts timing from the current moment.
   */
  reset() {
    this.stopped = 0;
    this.started = this.getTime();
  }

  /**
   * Stops the timer and returns the instance for chaining.
   * @returns {Timer} The timer instance for method chaining
   * 
   * @example
   * const timer = new Timer();
   * // ... do work ...
   * timer.stop().elapsed(); // Get elapsed time
   */
  stop() {
    this.stopped = this.getTime();
    return this;
  }

  /**
   * Calculates the elapsed time since the timer started.
   * @param {number} scale - Scale factor to apply to the result (default: 1)
   * @returns {number} Elapsed time in milliseconds divided by scale
   * 
   * @example
   * const timer = new Timer();
   * // ... do work ...
   * const seconds = timer.elapsed(1000); // Convert to seconds
   */
  elapsed(scale = 1) {
    const { started, stopped } = this;
    return ((stopped ? stopped : this.getTime()) - started)/scale;
  }

  /**
   * Calculates the speed (operations per second) based on elapsed time.
   * @param {number} length - Number of operations completed
   * @returns {number} Operations per second
   * 
   * @example
   * const timer = new Timer();
   * // ... process 1000 items ...
   * const opsPerSecond = timer.speed(1000);
   */
  speed(length) {
    return length/this.elapsed();
  }

};