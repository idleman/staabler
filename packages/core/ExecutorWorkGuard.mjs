import Executor from './Executor.mjs';

/**
 * The work object guarantees that the provided Executor#run() method will not
 * return before the provided work guard has been reset or disposed.
 */
export default class ExecutorWorkGuard {

  /**
   * Creates a new ExecutorWorkGuard instance.
   * @param {Executor} executor - Executor instance to guard
   */
  constructor(executor = Executor.getInstance()) {
    this.executor = executor;
    const { promise, resolve } = Promise.withResolvers();
    this._resolve = resolve;
    executor.post(() => promise);
  }

  /**
   * Checks if the work guard is currently enabled.
   * @returns {boolean} True if the guard is enabled
   */
  isEnabled() {
    return this._resolve !== null;
  }

  /**
   * Checks if the work guard is currently disabled.
   * @returns {boolean} True if the guard is disabled
   */
  isDisabled() {
    return this._resolve === null;
  }

  /**
   * Enables the work guard, preventing the executor from completing.
   */
  enable() {
    if(this._resolve === null) {
      const { promise, resolve } = Promise.withResolvers();
      this._resolve = resolve;
      this.executor.post(() => promise);
    }
  }

  /**
   * Disables the work guard, allowing the executor to complete.
   */
  disable() {
    this._resolve?.();
    this._resolve = null;
  }

  /**
   * Disposable implementation that disables the guard when disposed.
   */
  [Symbol.dispose]() {
    this.disable();
  }

};