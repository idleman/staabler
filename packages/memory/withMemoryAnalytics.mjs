import noop from '@staabler/core/noop.mjs';
import { toUnit } from './test-utils.mjs';
import Timer from '@staabler/core/Timer.mjs';
import getMemoryUsage from './getMemoryUsage.mjs';
import withValue from '@staabler/core/withValue.mjs';

/**
 * Wraps a function with memory analytics to track memory usage during execution.
 * Provides detailed memory usage statistics and performance metrics.
 * 
 * @param {Function} cb - The function to wrap with memory analytics
 * @returns {Function} A wrapped function that tracks memory usage with additional methods
 */
export default function withMemoryAnalytics(cb) {
  const history = [];
  const gc = globalThis.gc ?? noop;
  const execute = (...args) => {
    gc();
    const timer = new Timer()
    const initial = getMemoryUsage();
    const onResult = result => {
      const time = timer.elapsed();
      gc();
      const usage = getMemoryUsage();
      const cost = usage - initial;
      const record = { cost, time, usage, initial };

      
      const map = (maybe = noop) => {
        return {
          time: `${time/1000} s`,
          cost: toUnit(cost),
          usage: toUnit(usage),
          initial: toUnit(initial),
          ...maybe(record, toUnit),
        };
      }
      
      
      history.push({
        ...record,
        map
      })
      return result;
    };
    
    let lastDebugMessage = timer.elapsed();
    const context = {
      /**
       * Outputs debug messages with rate limiting.
       * 
       * @param {string} msg - Debug message to output
       */
      debug(msg) {
        const elapsed = timer.elapsed() - lastDebugMessage;
        if(elapsed < 100) {
          return;
        }
        lastDebugMessage = timer.elapsed();
        process.stdout.write(`${msg}`.padEnd(80, '\b'));
      }
    }
    return withValue(cb.apply(context, args), onResult);
  };

  return Object.assign(execute, {
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