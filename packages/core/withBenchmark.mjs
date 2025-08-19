import Timer from './Timer.mjs';

/**
 * Wraps a function with benchmarking capabilities.
 * Returns a function that measures execution time and provides timing methods.
 * 
 * @param {Function} cb - The function to benchmark
 * @returns {Function} A wrapped function with timer methods attached
 * 
 * @example
 * const benchmarkedFn = withBenchmark(async (data) => {
 *   return await processData(data);
 * });
 * 
 * const result = await benchmarkedFn('test');
 * console.log(`Elapsed: ${benchmarkedFn.elapsed()}ms`);
 * console.log(`Speed: ${benchmarkedFn.speed(1000)} ops/sec`);
 */
export default function withBenchmark(cb) {
  const timer = new Timer();
  const call = async (...args) => {
    let result;
    timer.reset();
    try {
      result = await cb(...args);
    } finally {
      timer.stop();
    }
    return result;
  };

  return Object.assign(call, timer);
};