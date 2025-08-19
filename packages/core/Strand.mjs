import noop from './noop.mjs';
import autobind from './autobind.mjs';

/**
 * @deprecated
 * Try to use ExecutorStrand instead.
 * 
 * A utility class for managing sequential execution of asynchronous operations.
 * Ensures that operations are executed in order, one after another.
 * 
 * @example
 * const strand = new Strand();
 * strand.post(async () => await fetch('/api/1'));
 * strand.post(async () => await fetch('/api/2')); // Will wait for first to complete
 */
export default class Strand {

  /**
   * Creates a new Strand instance with autobound methods.
   */
  constructor() {
    autobind(this);
    this.promise = Promise.resolve();
  }

  /**
   * Wraps a callback function to ensure it executes in sequence.
   * @param {Function} cb - The callback function to wrap
   * @returns {Function} A wrapped function that maintains execution order
   * 
   * @example
   * const strand = new Strand();
   * const wrappedFn = strand.wrap(async (data) => {
   *   return await processData(data);
   * });
   * wrappedFn('test'); // Will execute in sequence
   */
  wrap(cb) {
    return (...args) => {
      return this.post(() => cb(...args));
    };
  }

  /**
   * Posts a callback to be executed in sequence.
   * @template T
   * @param {() => Promise<T>} cb - The callback function to execute
   * @returns {Promise<T>} A promise that resolves with the callback result
   * 
   * @example
   * const strand = new Strand();
   * const result = await strand.post(async () => {
   *   return await fetch('/api/data');
   * });
   */
  post(cb) {
    const external = this.promise.then(cb);
    this.promise = external.then(noop, noop);
    return external;
  }

};