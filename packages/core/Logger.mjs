/**
 * Singleton logger class that delegates logging to an optional receiver.
 */
let instance = null;

export default class Logger {

  /**
   * Gets the singleton instance of Logger.
   * @returns {Logger} The singleton Logger instance
   */
  static getInstance() {
    if(!instance) {
      instance = new Logger();
    }
    return instance;
  }

  /**
   * Creates a new Logger instance.
   * @param {Object} receiver - Optional receiver object with log, warn, and error methods
   */
  constructor(receiver = null) {
    this._receiver = receiver;
  }

  /**
   * Logs a message using the receiver's log method if available.
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    this._receiver?.log(...args);
  }

  /**
   * Logs a warning using the receiver's warn method if available.
   * @param {...any} args - Arguments to log as warning
   */
  warn(...args) {
    this._receiver?.warn(...args);
  }
  
  /**
   * Logs an error using the receiver's error method if available.
   * @param {...any} args - Arguments to log as error
   */
  error(...args) {
    this._receiver?.error(...args);
  }
  
};