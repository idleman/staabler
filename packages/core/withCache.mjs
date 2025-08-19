/**
 * Create a memoized function that stores the values in the provided
 * MapLike collection.
 * 
 * @param {Map|WeakMap} cache - The cache collection to store results
 * @param {Function} factory - The factory function to generate values
 * @returns {Function} A memoized function that caches results
 * 
 * @example
 * const getSymbol = withCache(new Map(), key => Symbol(key));
 * getSymbol('john') === getSymbol('john'); // => true
 * 
 * @example
 * const expensiveCalculation = withCache(new Map(), (input) => {
 *   // Expensive computation here
 *   return input * 2;
 * });
 * expensiveCalculation(5); // Computes and caches
 * expensiveCalculation(5); // Returns cached result
 */
export default function withCache(cache, factory) {
  return key => {
    const maybe = cache.get(key);
    if(maybe !== void(0)) {
      return maybe;
    }

    const value = factory(key, cache);
    cache.set(key, value);
    return value;
  };
};