import noop from './noop.mjs';
import Timer from './Timer.mjs';
import tryCatch from './tryCatch.mjs';
import isNullish from './isNullish.mjs';
import withValue from './withValue.mjs';
import OrderedArray from './OrderedArray.mjs';
import createResolvablePromise from './createResolvablePromise.mjs';

//  Previous implemenation were kind of a window counter algorithm
//  but it cause too much performance penalty so the new algorithm
//  tries to use the token bucket algorithm

/**
 * Default comparison function for rate limit items.
 * @param {Object} a - First item to compare
 * @param {Object} b - Second item to compare
 * @returns {number} Comparison result
 */
const defaultCompare = (a, b) => a.id - b.id;

/**
 * Creates a function that enforces a rate limit on executions.
 * Uses a token bucket algorithm for efficient rate limiting.
 * 
 * @param {...(Function|number|Function)} options - Comparison function, limit, and callback
 * @returns {Function} A rate-limited version of the callback function
 * 
 * @example
 * // Limit to 10 requests per second
 * const rateLimitedFetch = withRateLimit(10, async (url) => {
 *   return await fetch(url);
 * });
 * 
 * // Multiple calls will be rate limited
 * const promises = urls.map(url => rateLimitedFetch(url));
 * 
 * @example
 * // Custom comparison function
 * const customCompare = (a, b) => a.priority - b.priority;
 * const priorityLimited = withRateLimit(customCompare, 5, async (task) => {
 *   return await processTask(task);
 * });
 */
export default function withRateLimit(...options) {
  const cb = options.pop() ?? noop;
  const limit = options.pop() ?? 1; // How many request per second
  const compare = options.shift() ?? defaultCompare;

  if(limit <= 0) {
    throw new Error(`Limit option in withrateLimit must be a positive number`);
  }
  
  let lastId = 0;
  let tokens = limit;
  let intervalId = null;
  const rateLimit = (1/limit)*1000;
  const items = new OrderedArray(compare);
  const timer = new Timer();
  const notify = () => {
    const elapsed = timer.elapsed();
    const take = Math.floor(elapsed/rateLimit);
    tokens += take;
    if(limit < tokens) {
      tokens = limit;
    }
    const available = items.size;
    if(available === 0) {
      tokens = limit;
      if(intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }
    timer.reset();
    const length = Math.min(take, available);
    for(let i = 0; i < length; ++i) {
      const { args, promise } = items.shift();
      const result = tryCatch(() => cb(...args));
      withValue(result, ([val, err]) => isNullish(err) ? promise.resolve(val) : promise.reject(err));
    }
  };


  const schedule = (cb, ...args) => {
    if(0 <= --tokens) {
      return cb(...args);
    }
    const promise = createResolvablePromise();
    items.push({ id: ++lastId, args, promise });
    if(intervalId === null) {
      timer.reset();
      intervalId = setInterval(notify, Math.max(1, Math.floor(rateLimit)));
    }
    return promise;
  }
  
  return Object.assign((...args) => schedule(cb, ...args), {
    schedule
  });
};