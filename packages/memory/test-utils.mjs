import { strictEqual } from 'node:assert';
import noop from '@staabler/core/noop.mjs';
import Timer from '@staabler/core/Timer.mjs';
import withValue from '@staabler/core/withValue.mjs';

/**
 * Formats a number with locale-specific number formatting.
 * 
 * @param {number} v - The number to format
 * @returns {string} The formatted number string
 */
export const toNumber = v =>new Intl.NumberFormat().format(v);

/**
 * Converts a byte value to a human-readable string with appropriate units.
 * 
 * @param {number} value - The byte value to convert
 * @returns {string} The formatted string with units (B, Kb, Mb, Gb, Tb)
 */
export const toUnit = (() => {
  const units = ['B', 'Kb', 'Mb', 'Gb', 'Tb'];
  const entries = units.map((unit, index) => [1024**index, unit]);
  
  return function toUnit(value) {
    const index = entries.findIndex(([byteLength]) => value < byteLength) - 1;
    if(index < 0) {
      return `${value} B`;
    }

    const [byteLength, unit] = entries[index];
    return `${(value/byteLength).toFixed(2)} ${unit}`;
  }
})();

/**
 * Creates a function that checks if objects are sorted by age.
 * 
 * @returns {Function} A function that validates sorting order
 */
export function createSortedChecker() {
  let prev = -1;
  return obj => {
    const curr = obj.getAge();
    strictEqual(prev <= curr, true);
    prev = curr;
  };
};

/**
 * Gets the current memory usage of the process.
 * 
 * @returns {number} The resident set size (RSS) in bytes
 */
export function getMemoryUsage() {
  return process.memoryUsage().rss; // Returns the whole process memor
};

/**
 * Wraps a function with memory analytics to track memory usage during execution.
 * 
 * @param {Function} cb - The function to wrap with memory analytics
 * @returns {Function} A wrapped function that tracks memory usage
 */
export function withMemoryAnalytics(cb) {
  const history = [];
  const gc = globalThis.gc ?? noop;
  const options = { length: 1,BYTES_PER_ELEMENT: 1 };
  const execute = (...args) => {
    const timer = new Timer();
    gc();
    const initial = getMemoryUsage();
    const onResult = result => {
      const time = timer.elapsed();
      gc();
      const usage = getMemoryUsage();
      const cost = usage - initial;
      const { length, BYTES_PER_ELEMENT } = options;
      const overhead = cost - (length * BYTES_PER_ELEMENT);
      const ops = ((length/time) * 1000);
      const raw = { ...options, ops, cost, time, usage, initial, overhead };
      const record = {
        ...raw,
        toUnits() {
          return {
            ...raw,
            time: `${time/1000} s`,
            cost: toUnit(cost),
            usage: toUnit(usage),
            initial: toUnit(initial),
            overhead: toUnit(overhead),
            overheadPerElement: toUnit(overhead/length),
          }
        }
      };
      
      history.push(record)
      return record;
    };
    
    let lastDebugMessage = timer.elapsed();
    const backslash = ''.padEnd(80, '\b');
    const context = {
      debug(msg = '') {
        const elapsed = timer.elapsed() - lastDebugMessage;
        if(elapsed < 100) {
          return;
        }
        lastDebugMessage = timer.elapsed();
        const message = `${msg}`
          .substring(0, 80)
          .padEnd(80, ' ');
        process.stdout.write(`${backslash}${message}`);
      }
    }
    return withValue(cb.apply(context, args), onResult);
  };

  return Object.assign(execute, {
    /**
     * Sets configuration options for memory analytics.
     * 
     * @param {Object} opt - Options to set
     * @returns {Function} The execute function for chaining
     */
    set(opt) {
      Object.assign(options, opt);
      return execute;
    },
    /**
     * Gets memory usage history.
     * 
     * @param {number} [index=-1] - Index of the history record to retrieve
     * @returns {Object} Memory usage record
     */
    getMemoryUsage(index = -1) {
      return history.at(index);
    }
  });
};