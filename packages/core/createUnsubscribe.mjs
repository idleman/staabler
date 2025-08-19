/**
 * Creates a function that unsubscribes from multiple subscriptions.
 * 
 * Takes any number of unsubscribe functions or arrays of unsubscribe functions
 * and returns a single function that calls all of them when invoked.
 * 
 * @param {...Function|Array<Function>} args - Unsubscribe functions or arrays of unsubscribe functions
 * @returns {Function} A function that calls all unsubscribe functions when invoked
 * 
 * @example
 * // Single unsubscribe functions
 * const unsubscribe1 = () => console.log('Unsubscribed from service 1');
 * const unsubscribe2 = () => console.log('Unsubscribed from service 2');
 * 
 * const unsubscribe = createUnsubscribe(unsubscribe1, unsubscribe2);
 * unsubscribe(); // Calls both unsubscribe functions
 * 
 * @example
 * // Mixed functions and arrays
 * const unsubscribe1 = () => console.log('Unsubscribed from service 1');
 * const unsubscribe2 = () => console.log('Unsubscribed from service 2');
 * const unsubscribe3 = () => console.log('Unsubscribed from service 3');
 * 
 * const unsubscribe = createUnsubscribe(
 *   unsubscribe1,
 *   [unsubscribe2, unsubscribe3]
 * );
 * unsubscribe(); // Calls all three unsubscribe functions
 * 
 * @example
 * // Nested arrays
 * const unsubscribes = [
 *   () => console.log('Service 1'),
 *   () => console.log('Service 2')
 * ];
 * 
 * const moreUnsubscribes = [
 *   () => console.log('Service 3'),
 *   () => console.log('Service 4')
 * ];
 * 
 * const unsubscribe = createUnsubscribe(unsubscribes, moreUnsubscribes);
 * unsubscribe(); // Calls all four unsubscribe functions
 * 
 * @example
 * // With non-function values (ignored)
 * const unsubscribe = createUnsubscribe(
 *   () => console.log('Valid function'),
 *   null,
 *   undefined,
 *   'not a function'
 * );
 * unsubscribe(); // Only calls the valid function
 */
export default function createUnsubscribe(...args) {
  const subscribers = args.flat(Infinity);
  return function unsubscribe() {
    subscribers.forEach(cb => typeof cb === 'function' ? cb() : void(0));
  };
}