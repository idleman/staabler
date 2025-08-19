import noop from './noop.mjs';
import Queue from './Queue.mjs';
import Logger from './Logger.mjs';
import autobind from './autobind.mjs';
import isThenable from './isThenable.mjs';
import DeadlineTimer from './DeadlineTimer.mjs';

let shared = null;
const defaultTime = Number.MAX_SAFE_INTEGER;

/**
 * Executes tasks synchronously and asynchronously with controlled concurrency.
 * Provides both immediate execution via dispatch() and queued execution via post().
 */
export default class Executor {

  /**
   * Returns a shared singleton instance of Executor.
   * @returns {Executor} The shared executor instance
   */
  static getInstance() {
    if(!shared) {
      shared = new Executor();
    }
    return shared;
  }

  /**
   * Creates a new Executor instance.
   * @param {Logger} logger - Logger instance for error handling
   */
  constructor(logger = Logger.getInstance()) {
    autobind(this);
    this.queue = new Queue();
    this.pending = [];
    this.logger = logger;
    this._running = 0;
    this._wakeup = noop;
  }

  /**
   * Executes a callback function, handling both sync and async results.
   * Swallows errors and logs them via the logger.
   * @param {Function} cb - Callback function to execute
   * @returns {*} The result of the callback or the promise if async
   */
  exec(cb = noop) {
    let maybe;
    try {
      maybe = cb();
    } catch(err) {
      this.logger.error(err);
      return;
    }

    if(!isThenable(maybe)) {
      return maybe;
    }
    // Wrap so we never leak and never throw out of band
    const pending = this.pending;
    const wrapped = maybe
      .catch(err => this.logger.error(err)) // swallow into value
      .finally(() => {
        const index = pending.indexOf(wrapped);
        if(index !== -1) {
          pending.splice(index, 1);
        }
      });

    pending.push(wrapped);
    return maybe;
  }

  /**
   * Checks if the executor is currently running tasks.
   * @returns {boolean} True if executor is running
   */
  isRunning() {
    return !!this._running;
  }

  /**
   * Executes a callback immediately if not running, otherwise queues it.
   * @param {Function} cb - Callback function to execute
   * @returns {Executor} This executor instance for chaining
   */
  dispatch(cb = noop) {
    if(this._running) {
      this.exec(cb);      
    } else {
      this.queue.push(cb);
    }
    return this;
  }

  /**
   * Queues a callback for later execution and wakes up the executor.
   * @param {Function} cb - Callback function to queue
   * @returns {Executor} This executor instance for chaining
   */
  post(cb = noop) {
    this.queue.push(cb);
    this._wakeup?.();
    return this;
  }
  
  /**
   * Executes queued tasks synchronously for a limited time.
   * @param {number} time - Maximum time to spend executing (milliseconds)
   * @returns {number} Number of tasks executed
   */
  poll(time = defaultTime) {
    ++this._running;
    let counter = 0;
    const queue = this.queue;
    const start = performance.now();
    while(queue.length) {
      const now = performance.now();
      const elapsed = now - start;
      if(time <= elapsed) {
        break;
      }
      const length = queue.length;
      for(let i = 0; i < length; ++i, ++counter) {
        this.exec(queue.shift());
      }
    }
    --this._running;
    return counter;
  }

  /**
   * Runs the executor asynchronously, executing all queued tasks and waiting for pending promises.
   * @param {number} time - Maximum time to spend executing (milliseconds)
   * @returns {Promise<number>} Promise resolving to number of tasks executed
   */
  async run(time = defaultTime) {
    ++this._running;
    let counter = 0;
    const queue = this.queue;
    const pending = this.pending;
    const start = performance.now();
    const resolver = Promise.withResolvers();
    pending.push(resolver.promise);
    const timer = new DeadlineTimer(resolver.resolve, time);
    
    while(queue.length || 1 < pending.length) {
      const now = performance.now();
      const elapsed = now - start;
      const remaining = time - elapsed;
      if(remaining <= 0) {
        break;
      }
      const count = this.poll(remaining);
      counter += count;
      if(count === 0) {
        const { promise, resolve } = Promise.withResolvers();
        pending.push(promise);
        this._wakeup = resolve;
        try {
          await Promise.race(pending);
        } finally {
          pending.splice(pending.indexOf(promise), 1);
          this._wakeup = noop;
        }
      }
    }

    timer.abort();
    const timeoutIndex = pending.indexOf(resolver.promise);
    if(timeoutIndex !== -1) {
      pending.splice(timeoutIndex, 1);
    }
    --this._running;
    return counter;
  }

};