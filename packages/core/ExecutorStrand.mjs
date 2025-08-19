import noop from './noop.mjs';
import Queue from './Queue.mjs';
import autobind from './autobind.mjs';
import Executor from './Executor.mjs';
import isThenable from './isThenable.mjs';


const defaultPlaceholder = Symbol('placeholder');
/**
 * The strand object guarantees that handlers posted or dispatched through
 * the strand will not be executed concurrently.
 */
export default class ExecutorStrand {

  /**
   * Creates a new ExecutorStrand instance.
   * @param {Executor} executor - Executor instance to use for task execution
   */
  constructor(executor = Executor.getInstance()) {
    autobind(this);
    this.queue = new Queue();
    this.executor = executor;
    this._running = 0;
  }

  /**
   * Wraps a function to ensure it executes sequentially through this strand.
   * @param {Function} cb - Function to wrap
   * @returns {Function} Wrapped function that executes sequentially
   */
  wrap(cb) {
    return (...args) => {
      let placeholder = defaultPlaceholder;
      this.dispatch(() => {
        let value;
        try {
          value = cb(...args);
        } catch(err) {
          if(placeholder === defaultPlaceholder) {
            throw err;
          } else {
            placeholder.reject(err);
            return;
          }
        }

        if(isThenable(value)) {
          // Depending if handler where executed right away
          if(placeholder === defaultPlaceholder) {
            placeholder = value;
          } else {
            value.then(placeholder.resolve, placeholder.reject);
          }
          return value;
        }
        if(placeholder === defaultPlaceholder) {
          placeholder = value;
        } else {
          placeholder.resolve(value);
        }
      });

      if(placeholder === defaultPlaceholder) {
        placeholder = Promise.withResolvers();
        return placeholder.promise;
      }
      return placeholder;
    };
  }

  /**
   * Dispatches a callback through the strand for immediate execution if possible.
   * @param {Function} cb - Callback function to execute
   * @returns {ExecutorStrand} This strand instance for chaining
   */
  dispatch(cb = noop) {
    this.executor.dispatch(() => this._consume(cb));
    return this;
  }

  /**
   * Posts a callback to the strand for queued execution.
   * @param {Function} cb - Callback function to queue
   * @returns {ExecutorStrand} This strand instance for chaining
   */
  post(cb = noop) {
    this.executor.post(() => this._consume(cb));
    return this;
  }

  /**
   * Consumes queued callbacks sequentially, ensuring no concurrent execution.
   * @param {Function} cb - Callback to add to the queue
   * @returns {*} Result of the callback execution
   */
  _consume(cb = noop) {
    const queue = this.queue;
    queue.push(cb);
    if(++this._running !== 1) {
      // Not the first thread
      return;
    }

    const logger = this.executor.logger;
    const tick = () => {
      while(queue.length) {
        let value;
        const cb = queue.shift();
        try {
          value = cb();
        } catch(err) {
          logger.error(err);
          continue;
        }

        if(isThenable(value)) {
          return value
            .catch(err => logger.error(err))
            .finally(tick);
        }
      }
      --this._running;
    };

    return tick();
  }

};