import noop from './noop.mjs';
import tryCatch from './tryCatch.mjs';
import withValue from './withValue.mjs';
import createResolvablePromise from './createResolvablePromise.mjs';

/**
 * Creates a function that limits the number of parallel executions.
 * Queues additional calls and executes them when slots become available.
 * 
 * @param {number} limit - Maximum number of parallel executions (default: 1)
 * @param {Function} cb - The function to limit (default: noop)
 * @returns {Function} A function that respects the parallel execution limit
 * 
 * @example
 * const limitedFetch = withParallelLimit(3, async (url) => {
 *   return await fetch(url);
 * });
 * 
 * // Only 3 requests will run in parallel, others will queue
 * const promises = urls.map(url => limitedFetch(url));
 * await Promise.all(promises);
 * 
 * @example
 * const limitedProcessing = withParallelLimit(2, async (data) => {
 *   // Heavy processing
 *   return await processData(data);
 * });
 * 
 * // Process items with max 2 concurrent operations
 * const results = await Promise.all(items.map(item => limitedProcessing(item)));
 */
export default function withParallelLimit(limit = 1, cb = noop) {
  const queue = [];
  const pending = new Set();
  
  function notify() {
    if(limit <= pending.size || queue.length === 0) {
      return;
    }
    const [promise, args] = queue.shift();
    const onComplete = (obj, method) => (pending.delete(promise), promise[method](obj), notify()); 
    const onReject = err => onComplete(err, 'reject');
    const onResolve = res => onComplete(res, 'resolve');
    pending.add(promise);
    return withValue(tryCatch(() => cb(...args)), ([value, err]) => err ? onReject(err) : onResolve(value));
  }
  return function wrapper(...args) {
    const promise = createResolvablePromise();
    queue.push([promise, args]);
    notify();
    return promise;
  }
};